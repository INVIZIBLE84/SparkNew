import { AuthUser, UserRole } from "@/types/user";
import { authAPI, ApiResponse } from "./api";

// Mock user credentials (fallback for development)
const mockCredentials: Record<string, { password: string; role: UserRole, name: string, id: string, department?: string, studentId?: string, facultyId?: string }> = {
  "student": { password: "password", role: "student", name: "Alice Smith", id: "student123", department: "Computer Science", studentId: "S12345" },
  "faculty": { password: "password", role: "faculty", name: "Dr. Alan Turing", id: "faculty999", department: "Computer Science", facultyId: "F999" },
  "admin": { password: "password", role: "admin", name: "Admin User", id: "admin001", department: "Administration" },
  "print": { password: "password", role: "print_cell", name: "Print Operator", id: "printcell007", department: "Printing Services" },
  "clearance": { password: "password", role: "clearance_officer", name: "Clearance Officer Lib", id: "clearance01", department: "Library" },
};

/**
 * Authenticates a user with email/username and password.
 * First tries the backend API, falls back to mock data if backend is unavailable.
 * @param emailOrUsername The email or username entered by the user.
 * @param password The password entered by the user.
 * @returns A promise resolving to an object indicating success and user info, or an error message.
 */
export async function authenticateUser(
  emailOrUsername: string,
  password?: string
): Promise<{ success: boolean; message: string; user?: AuthUser }> {
  console.log(`Attempting authentication for: ${emailOrUsername}`);
  
  // Basic validation
  if (!emailOrUsername || !password) {
    return { success: false, message: "Email/Username and password are required." };
  }

  // Try backend API first
  try {
    const response: ApiResponse = await authAPI.login(emailOrUsername, password);
    
    if (response.success && response.data) {
      // Store the token if provided
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }
      
      const user: AuthUser = {
        id: response.data.user.id,
        name: response.data.user.name,
        email: response.data.user.email,
        role: response.data.user.role,
        department: response.data.user.department,
        studentId: response.data.user.studentId,
        facultyId: response.data.user.facultyId,
        isAuthenticated: true,
        isLocked: response.data.user.isLocked || false,
      };
      
      console.log(`Backend authentication successful for ${emailOrUsername}`);
      return { success: true, message: "Login successful!", user: user };
    } else {
      return { success: false, message: response.message || "Authentication failed." };
    }
  } catch (error) {
    console.warn('Backend authentication failed, falling back to mock data:', error);
    
    // Fallback to mock authentication for development
    return authenticateWithMockData(emailOrUsername, password);
  }
}

/**
 * Fallback authentication using mock data
 */
function authenticateWithMockData(
  emailOrUsername: string,
  password: string
): { success: boolean; message: string; user?: AuthUser } {
  // --- Add admin/admin check for testing ---
  if (emailOrUsername.toLowerCase() === "admin@example.edu" && password === "admin") {
    console.log(`Mock authentication successful for test admin`);
    const adminUser: AuthUser = {
      id: "admin001",
      name: "Test Admin",
      email: "admin@example.edu",
      role: "admin",
      department: "Administration",
      isAuthenticated: true,
      isLocked: false,
    };
    return { success: true, message: "Login successful!", user: adminUser };
  }
  // --- End admin/admin check ---

  // Check if it's an email or username
  const isEmail = emailOrUsername.includes('@');
  const lookupKey = isEmail ? emailOrUsername.split('@')[0].toLowerCase() : emailOrUsername.toLowerCase();
  const storedUser = mockCredentials[lookupKey];

  if (storedUser && storedUser.password === password) {
    const user: AuthUser = {
      id: storedUser.id,
      name: storedUser.name,
      email: isEmail ? emailOrUsername : `${emailOrUsername}@example.edu`,
      role: storedUser.role,
      department: storedUser.department,
      studentId: storedUser.studentId,
      facultyId: storedUser.facultyId,
      isAuthenticated: true,
      isLocked: false,
    };
    console.log(`Mock authentication successful for ${emailOrUsername}`);
    return { success: true, message: "Login successful!", user: user };
  } else {
    console.log(`Mock authentication failed for ${emailOrUsername}`);
    return { success: false, message: "Invalid email/username or password." };
  }
}

/**
 * Logout user and clear stored data
 */
export async function logoutUser(): Promise<{ success: boolean; message: string }> {
  try {
    // Try to logout from backend
    await authAPI.logout();
  } catch (error) {
    console.warn('Backend logout failed:', error);
  }
  
  // Clear local storage
  localStorage.removeItem('authToken');
  
  return { success: true, message: "Logged out successfully" };
}

/**
 * Register a new user
 */
export async function registerUser(userData: {
  email: string;
  password: string;
  name: string;
  role: string;
  department: string;
  rollNumber?: string;
  year?: number;
}): Promise<{ success: boolean; message: string; user?: AuthUser }> {
  try {
    const response: ApiResponse = await authAPI.register(userData);
    
    if (response.success && response.data) {
      // Store the token if provided
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }
      
      const user: AuthUser = {
        id: response.data.user.id,
        name: response.data.user.name,
        email: response.data.user.email,
        role: response.data.user.role,
        department: response.data.user.department,
        studentId: response.data.user.studentId,
        facultyId: response.data.user.facultyId,
        isAuthenticated: true,
        isLocked: response.data.user.isLocked || false,
      };
      
      console.log(`Registration successful for ${userData.email}`);
      return { success: true, message: "Registration successful!", user: user };
    } else {
      return { success: false, message: response.message || "Registration failed." };
    }
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: "Registration failed. Please try again." };
  }
}

/**
 * Get current user profile from backend
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const response: ApiResponse = await authAPI.getProfile();
    
    if (response.success && response.data) {
      return {
        id: response.data.id,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role,
        department: response.data.department,
        studentId: response.data.studentId,
        facultyId: response.data.facultyId,
        isAuthenticated: true,
        isLocked: response.data.isLocked || false,
      };
    }
  } catch (error) {
    console.warn('Failed to get user profile from backend:', error);
  }
  
  return null;
}
