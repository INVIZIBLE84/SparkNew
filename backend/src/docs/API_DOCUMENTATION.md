# V.E.D.A.N.T. API Documentation

## Base URL
`https://api.vedant-attendance.edu/v1`

## Authentication
All endpoints require JWT authentication unless noted otherwise.

## Rate Limits
- 100 requests/minute for authenticated users
- 20 requests/minute for public endpoints

## Endpoint Categories

### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/login` | POST | User login |
| `/auth/refresh` | POST | Refresh access token |

### Attendance
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/attendance/sessions` | POST | Create attendance session |
| `/attendance/sessions/{id}` | GET | Get session details |

[View Full API Documentation](./swagger)