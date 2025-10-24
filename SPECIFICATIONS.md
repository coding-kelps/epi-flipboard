### **1. Overview**

#### **1.1 Objective**

Develop a cross-platform digital content aggregation platform, functionally similar to **Flipboard** ([www.flipboard.com](http://www.flipboard.com)), accessible via:
- **Web**: [https://flipboard.kelps.io](https://flipboard.kelps.io)
- **Mobile apps**: iOS and Android

The platform allows users to discover, curate, and read information from various sources and topics in a personalized, magazine-style interface.

### **2. Platforms Targets**

| Platform    | Target Devices                                  | Notes                                                   |
| ----------- | ----------------------------------------------- | ------------------------------------------------------- |
| Web App     | Modern browsers (Chrome, Safari, Edge, Firefox) | Responsive, SEO-optimized                               |
| iOS App     | iPhone, iPad (iOS 15+)                          | Available as an IPA from the GitHub repository releases |
| Android App | Phones & Tablets (Android 10+)                  | Available as an APK from the GitHub repository releases |

#### **2.1 Suggested Technology Stack**

| Layer                          | Technology (Proposed) |
| ------------------------------ | --------------------- |
| **Frontend (Mobile & Web)**    | ???                   |
| **Backend**                    | Rust (Axum)           |
| **Database**                   | PostgreSQL            |
| **Hosting Infrastructure**     | Kubernetes cluster    |
| **CI/CD**                      | GitHub Actions        |

### **3. Functional Requirements**

#### **3.1 User Accounts and Authentication**

- **Create Account**
    - Register with email & password.
    - Verify email before activation.
- **Login / Logout**
    - Secure authentication (JWT or session-based).
- **Account Management**
    - Modify profile info (name, email).
    - Change password.
    - Delete (sign out) account — GDPR-compliant data deletion.
- **Third-Party Authentication**
    - Login/Sign-up with Google.
    - Login/Sign-up with GitHub.
- **GDPR Compliance**
    - Consent management during signup.
    - Data export and delete capabilities.
    - Privacy policy acceptance required.
#### **3.2 Information Sources and Topics**

- **Source Listing**
    - All users (logged or guest) can browse available sources (RSS feeds, publishers, etc.).
    - Sources include metadata (name, description, link, category).
- **Topic Listing**
    - All users can browse available topics.
    - Topics are grouped thematically (e.g., Technology, Sports, Politics).

#### **3.3 Feed Creation and Management**

- **Create Feed**
    - Logged-in users can create a custom feed by:
        - Selecting from available sources, **or**
        - Selecting topics of interest.
- **Feed Display**
    - Aggregates and displays content from chosen sources/topics.
    - Ordered chronologically (most recent first).
    - Includes title, image (if available), short description, source link.
- **Feed Actions**
    - Edit feed (add/remove sources or topics).
    - Delete feed.

#### **3.4 Content Display**

- **Feed Reader**
    - Displays aggregated articles.
    - Clicking an article opens the source content (in-app or new tab).
    - Supports pagination or infinite scroll.
- **Guest Access**
    - Guests can view sources and topics but cannot create feeds.
    - Option to sign up or log in to personalize experience.

### **4. Non-Functional Requirements**

| Category            | Specification                                                                                                                   |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Security**        | HTTPS-only, data encryption in transit and at rest, password hashing (HASH TO DEFINE). SBOM generation for supply chain attack. |
| **Performance**     | Feeds load in <2s on average; backend handles 10k concurrent users.                                                             |
| **Scalability**     | Horizontally scalable backend.                                                                                                  |
| **Availability**    | SLI based on the server uptime (heartbeat metric) with an SLO of 90%                                                            |
| **GDPR Compliance** | User consent tracking, right to access/delete data.                                                                             |
| **Localization**    | English.                                                                                                                        |
| **Monitoring**      | Metrics and logging exporting following OpenTelemetry                                                                           |

### **5. Testing and Quality Assurance**

#### **5.1 Testing Scope**

Testing will cover all major functional and non-functional requirements, including:
- Unit testing for backend and frontend components.
- Integration tests for API endpoints and data flow.
- End-to-end (E2E) tests simulating real user interactions.
- Load and performance testing (target response time <2s).
- Security and penetration testing for vulnerabilities.

#### **5.2 Code Coverage Target**

- Minimum **80% test coverage** required across:
    - Backend APIs and business logic.
    - Frontend UI components.
- Coverage reports will be generated automatically during CI runs.
- Builds failing to meet coverage thresholds will be rejected during pipeline execution.

#### **5.3 Continuous Integration & Delivery**

- CI pipeline to run tests, linting, and coverage reports automatically.
- Automated deployment to Kubernetes environments upon successful test completion.
- Quality gates enforced through pull request reviews and static analysis tools.

### **6. API Requirements (High-Level)**

| Endpoint              | Method         | Description                    |
| --------------------- | -------------- | ------------------------------ |
| `/auth/signup`        | POST           | Create new user account        |
| `/auth/verify-email`  | GET            | Verify user email              |
| `/auth/login`         | POST           | Authenticate user              |
| `/auth/logout`        | POST           | End session                    |
| `/auth/oauth/google`  | POST           | Google sign-in                 |
| `/auth/oauth/github`  | POST           | GitHub sign-in                 |
| `/user/profile`       | GET/PUT/DELETE | Retrieve/update/delete profile |
| `/sources`            | GET            | List information sources       |
| `/topics`             | GET            | List available topics          |
| `/feeds`              | GET/POST       | List or create user feeds      |
| `/feeds/:id`          | GET/PUT/DELETE | Manage a specific feed         |
| `/feeds/:id/articles` | GET            | Retrieve articles for a feed   |

### **7. Future Enhancements (Optional)**

- Personalized AI-based article recommendations.    
- Offline reading mode (mobile).
- Dark/light mode toggle.
