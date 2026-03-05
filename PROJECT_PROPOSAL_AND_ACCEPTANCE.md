# Barangay New Cabalan — Online Document Request System  
## Project Proposal, Scope & Acceptance

---

## Project Title

**Barangay New Cabalan — Online Document Request System**

---

## Team Information

| Role | Name | Contact |
|------|------|---------|
| **Developer** | Janzen Egnisaban | azeegnisaban221@gmail.com |
| **Project Location** | Barangay New Cabalan | — |

---

## 1. Introduction

### 1.1 Overview

The **Document Request Portal** is a web-based system for Barangay New Cabalan that allows residents to request barangay documents online, track their application status, and download approved documents. It reduces the need for in-person visits and manual paperwork while giving the barangay a central place to manage and process requests.

Residents can submit requests as **guests** (with tracking number only) or as **registered users** (with dashboard and history). Barangay staff use an **admin dashboard** to review requests, move them through a clear workflow, generate documents, and view reports.

### 1.2 Project Scope

Traditional document request processes often involve long waits, paper forms, unclear status, and limited office hours. This project addresses those issues by providing:

- **24/7 online access** for submitting and tracking document requests  
- **Transparent status** via unique tracking numbers and clear workflow stages  
- **Less manual work** through automated status workflow and duplicate detection  
- **Controlled requirements** (e.g., ID, proof of residency, 2×2 photo where applicable)  
- **Digital issuance** so approved documents can be viewed and downloaded  

The system is built as a **client-side web application** (HTML, CSS, JavaScript) with data stored in the browser (localStorage) in the current phase. It is intended to be adaptable for future backend and database integration.

---

## 2. Technical Requirements & Implementation

### 2.1 Primary Objectives

| Objective | How the System Addresses It |
|-----------|----------------------------|
| **Improve accessibility** | Residents can request documents online 24/7. Guest access (no account) and registered user access (dashboard, history) are both supported. |
| **Enhance transparency** | Unique tracking numbers and real-time status (Pending → For Printing → For Signing → Ready → Completed / Rejected). |
| **Increase efficiency** | Status workflow reduces manual steps; duplicate detection and rate limits (e.g., max requests per email per day) reduce redundant requests. |
| **Ensure compliance** | Required fields and file uploads (ID, proof of residency, 2×2 picture for Barangay Clearance); validation before moving to critical steps (e.g., printing). |
| **Modernize service** | Digital request forms, status tracking, and document generation/print view for approved requests. |

### 2.2 Document Types Supported

- Barangay Clearance (with 2×2 picture requirement)  
- Certificate of Indigency  
- Certificate of Residency  
- Business Permit Clearance  
- Community Tax Certificate  
- Other (barangay-issued certificates)

### 2.3 Request Workflow (Statuses)

1. **Pending** — Request submitted, awaiting barangay review  
2. **For Printing** — Approved; document is being prepared/printed  
3. **For Signing** — Printed; awaiting Barangay Captain’s signature  
4. **Ready** — Signed; ready for pickup or download  
5. **Completed** — Picked up or downloaded by resident  
6. **Rejected** — Request denied (with reason if applicable)

### 2.4 Technology Stack (Current Phase)

- **Frontend:** HTML5, CSS3, Vanilla JavaScript  
- **Storage:** Browser localStorage (client-side only)  
- **Deployment:** Static hosting (e.g., GitHub Pages or similar); no server in current phase  

*Note: For production, the project is designed to be extended with a backend, database, and proper file storage.*

---

## 3. Budget & Resource Allocation

### 3.1 Development Resources

- **Human:** 1 Full-Stack Developer (Janzen Egnisaban); part-time QA/testing (e.g., community volunteers); barangay staff for user acceptance testing  
- **Current phase:** Development and hosting in low-cost/free options (e.g., GitHub Pages); optional domain (~₱500–1,000/year)  
- **Future phase (indicative):** Server hosting ~₱2,000–5,000/month; domain and SSL ~₱2,000/year  

---

## 4. Expected Outcomes

### 4.1 For Residents

- **Convenience:** 24/7 access, fewer office visits, shorter queues, mobile-friendly use  
- **Transparency:** Real-time tracking, clear stages, and digital download when ready  
- **Efficiency:** Target 3–5 day processing (from submission to ready), tracking number, fewer follow-up visits  

### 4.2 For Administration

- **Operations:** Central dashboard, less paperwork, automated status tracking, better planning  
- **Data:** Resident records, request history, duplicate detection, and basic reports/analytics  
- **Service quality:** Faster turnaround, audit trail, higher resident satisfaction  

### 4.3 Target Metrics (Goals)

- Processing: 3–5 days (improvement from 7–10 days)  
- Fewer office visits; high satisfaction; no data loss/breaches  
- High adoption of online requests; responsive interface; support for many concurrent users where applicable  

---

## 5. Benefits for the Barangay

1. **Streamlined administration** — Automated record-keeping, fewer errors, simpler issuance of certificates and clearances.  
2. **Better service delivery** — Faster response to requests and clearer identification of beneficiaries for programs.  
3. **Data-informed decisions** — Accurate records support demographic and program planning.  
4. **Financial oversight** — Better tracking of transactions and document issuance.  
5. **Foundation for integration** — Same data and workflow can support future links to municipal/provincial systems (e.g., health, education, disaster response).  

---

## 6. Risks & Challenges

- **Privacy:** Sensitive resident data must be protected; compliance with RA 10173 (Data Privacy Act) is required.  
- **Coverage:** Not all residents may have internet access; mobile-friendly design and optional office assistance help.  
- **Capacity:** Barangay staff may need training and clear procedures to maintain and use the system.  
- **Data maintenance:** Records must be kept up to date (e.g., residency changes) for reliability.  

---

## 7. Key Advantages

1. **Reliable records** — ID-based verification reduces duplication and incomplete or fake entries.  
2. **Efficient processing** — Online request, tracking, and digital issuance reduce queues and manual logs.  
3. **Stronger data for programs** — Verified resident data supports social services, subsidies, and relief distribution.  
4. **Security & compliance** — ID-based registration and clear workflows support fraud prevention and audit trails.  
5. **Community empowerment** — Easier access to services and support for e-governance and transparency.  

---

## 8. Example User Workflow

1. Resident visits the portal (guest or logged in).  
2. Submits a document request (e.g., Barangay Clearance), uploads required ID and proof of residency (and 2×2 if required).  
3. Receives a unique tracking number; can track status anytime.  
4. Barangay staff verify details and move request: Pending → For Printing → For Signing → Ready.  
5. Resident is notified (or checks portal); document is issued digitally (download/print) or for pickup.  
6. Status set to **Completed**; record kept in the system.  

---

## 9. Data Privacy — RA 10173 Compliance

### 9.1 Core Principles

- **Transparency** — Inform residents what data is collected (name, ID, address, contact, etc.), why, and how it is used; publish a Privacy Notice on the system and at the barangay office.  
- **Legitimate purpose** — Collect only data necessary for document requests and verification.  
- **Proportionality** — Limit collection to what is adequate and relevant (e.g., one valid ID unless strictly necessary).  

### 9.2 Compliance Steps

1. **Lawful processing** — Obtain consent before collecting data; allow residents to withdraw consent where applicable.  
2. **Rights of data subjects** — Allow access, correction, and request for deletion; designate a contact (e.g., Data Protection Officer) for privacy concerns.  
3. **Security** — Protect stored data (e.g., encryption for sensitive fields); restrict access to authorized barangay staff; periodic review of access and security.  
4. **Data retention & disposal** — Retain records only as long as necessary; define retention periods and secure deletion for expired or unnecessary data.  
5. **NPC registration** — If the barangay processes sensitive personal information (IDs, addresses, etc.) at scale, register as a Personal Information Controller (PIC) with the National Privacy Commission where required.  

*This section should be implemented in policy and in the system (e.g., privacy notice, consent, access/correction/deletion procedures) as the project is deployed.*

---

## 10. Conclusion

The Document Request Portal modernizes how Barangay New Cabalan handles document requests: residents get 24/7 access and transparency, while the administration gains efficiency, better records, and a basis for future e-governance. The project is scoped to be scalable and aligned with RA 10173 and barangay service goals.

---

## 11. Acceptance and Sign-off

By signing below, the parties acknowledge that they have read, understood, and accept this Project Proposal and agree to the scope, objectives, and compliance considerations described herein for the **Barangay New Cabalan — Online Document Request System**.

---

### Barangay (Implementing Office)

**Barangay New Cabalan**

| Role | Name (Printed) | Signature | Date |
|------|----------------|-----------|------|
| Barangay Captain | _________________________ | _________________________ | __________ |
| Barangay Secretary (or Authorized Representative) | _________________________ | _________________________ | __________ |

*I/We accept this project proposal and authorize the deployment and use of the Document Request Portal for Barangay New Cabalan.*

---

### Developer

| Role | Name (Printed) | Signature | Date |
|------|----------------|-----------|------|
| Developer | Janzen Egnisaban | _________________________ | __________ |

*I accept the scope and deliverables described in this document and will deliver the system in accordance with the agreed technical and compliance requirements.*

---

### Data Privacy / Compliance (Optional)

| Role | Name (Printed) | Signature | Date |
|------|----------------|-----------|------|
| Data Protection Officer / Privacy Liaison | _________________________ | _________________________ | __________ |

*I acknowledge the data privacy and RA 10173 compliance requirements stated in this document and confirm that the barangay will implement the necessary policies and procedures.*

---

**Document version:** 1.0  
**Last updated:** March 2025  
**Project:** Barangay New Cabalan — Online Document Request System  
**Developer:** Janzen Egnisaban — azeegnisaban221@gmail.com  

---

*This document may be kept on file at the Barangay New Cabalan office and with the developer for reference and audit purposes.*
