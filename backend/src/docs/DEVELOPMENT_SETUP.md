# V.E.D.A.N.T. Development Setup Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Running the Application](#running-the-application)
4. [Testing](#testing)
5. [Code Quality](#code-quality)
6. [Debugging](#debugging)
7. [Common Tasks](#common-tasks)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### Hardware Requirements
- **Minimum**:
  - 4GB RAM
  - Dual-core CPU
  - 5GB free disk space
- **Recommended**:
  - 8GB+ RAM
  - Quad-core CPU
  - SSD storage

### Software Requirements
| Software       | Version   | Installation Guide                     |
|----------------|-----------|---------------------------------------|
| Node.js        | 18.x      | [Node.js Downloads](https://nodejs.org)|
| npm            | 9.x+      | Bundled with Node.js                   |
| Docker         | 20.10+    | [Docker Docs](https://docs.docker.com) |
| Firebase CLI   | 12.0+     | `npm install -g firebase-tools`        |
| Redis          | 6.2+      | `docker run redis`                     |
| PostgreSQL     | 13+       | `docker run postgres`                  |

## Environment Setup

### 1. Clone the Repository
```bash
git clone https://github.com/vedant0/backend.git
cd vedant-backend