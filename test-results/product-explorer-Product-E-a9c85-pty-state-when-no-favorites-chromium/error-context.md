# Page snapshot

```yaml
- generic [ref=e2]:
  - link "Skip to main content" [ref=e3] [cursor=pointer]:
    - /url: "#main-content"
  - banner [ref=e5]:
    - generic [ref=e7]:
      - link "Product Explorer Home" [ref=e8] [cursor=pointer]:
        - /url: /
        - img [ref=e9]
        - generic [ref=e12]: Product Explorer
      - navigation [ref=e13]:
        - link [ref=e14] [cursor=pointer]:
          - /url: /catalog
          - text: Catalog
        - link [ref=e15] [cursor=pointer]:
          - /url: /favorites
          - text: Favorites
        - link [ref=e16] [cursor=pointer]:
          - /url: /admin
          - text: Admin
        - button [ref=e17] [cursor=pointer]: 🔒 Guest Mode
  - main [ref=e18]:
    - generic [ref=e20]:
      - generic [ref=e23]:
        - heading "My Favorites" [level=1] [ref=e24]
        - paragraph [ref=e25]: No favorites yet
      - generic "No favorites yet" [ref=e26]:
        - status [ref=e27]:
          - img [ref=e28]
          - paragraph [ref=e30]: No favorites yet
          - paragraph [ref=e31]: Start adding products to your favorites by clicking the heart icon on any product
          - generic [ref=e32]: Browse Catalog
```