# Architecture Decision Records

## ADR 1: Hybrid Database Approach
**Date**: 2023-10-15  
**Status**: Approved  
**Context**: Need for real-time updates and complex analytics  
**Decision**: Use Firestore for operational data, PostgreSQL for analytics  
**Consequences**: 
- Added complexity in data synchronization
- Better performance for respective use cases

## ADR 2: Multi-Code Attendance Verification
**Date**: 2023-10-20  
**Status**: Approved  
**Context**: Prevent proxy attendance marking  
**Decision**: Implement 3-code system with random correct code  
**Consequences**:
- Improved attendance authenticity
- Slightly more complex client implementation