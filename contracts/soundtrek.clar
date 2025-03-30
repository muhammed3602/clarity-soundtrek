;; SoundTrek Contract

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))

;; Data structures
(define-map entries 
  { entry-id: uint }
  {
    title: (string-ascii 100),
    audio-url: (string-ascii 200),
    creator: principal,
    latitude: int,
    longitude: int,
    timestamp: uint,
    is-public: bool
  }
)

(define-map entry-permissions
  { entry-id: uint, user: principal }
  { can-access: bool }
)

;; Data vars
(define-data-var entry-id-nonce uint u0)

;; Public functions
(define-public (create-entry (title (string-ascii 100)) (audio-url (string-ascii 200)) (location {latitude: int, longitude: int}))
  (let
    (
      (new-id (+ (var-get entry-id-nonce) u1))
    )
    (map-set entries
      { entry-id: new-id }
      {
        title: title,
        audio-url: audio-url,
        creator: tx-sender,
        latitude: (get latitude location),
        longitude: (get longitude location),
        timestamp: block-height,
        is-public: false
      }
    )
    (var-set entry-id-nonce new-id)
    (ok new-id)
  )
)

(define-public (share-entry (entry-id uint) (user principal))
  (let
    (
      (entry (unwrap! (map-get? entries {entry-id: entry-id}) err-not-found))
    )
    (asserts! (is-eq tx-sender (get creator entry)) err-unauthorized)
    (map-set entry-permissions
      { entry-id: entry-id, user: user }
      { can-access: true }
    )
    (ok true)
  )
)

(define-public (make-public (entry-id uint))
  (let
    (
      (entry (unwrap! (map-get? entries {entry-id: entry-id}) err-not-found))
    )
    (asserts! (is-eq tx-sender (get creator entry)) err-unauthorized)
    (map-set entries
      { entry-id: entry-id }
      (merge entry { is-public: true })
    )
    (ok true)
  )
)

;; Read only functions
(define-read-only (get-entry (entry-id uint))
  (let
    (
      (entry (unwrap! (map-get? entries {entry-id: entry-id}) err-not-found))
    )
    (if (or
          (is-eq tx-sender (get creator entry))
          (get is-public entry)
          (default-to 
            false
            (get can-access (map-get? entry-permissions {entry-id: entry-id, user: tx-sender}))
          )
        )
      (ok entry)
      err-unauthorized
    )
  )
)
