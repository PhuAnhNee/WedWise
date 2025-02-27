import axios from "axios";
import {jwtDecode} from "jwt-decode";

interface LoginCredentials {
    email: string;
    password: string;
}

interface RegisterCredentials {
    fullName: string;
    phone: string;
    email: string;
    password: string;
    avatarUrl?: string;
    role?: number; // Mặc định là 2 nếu không truyền
}

interface LoginResponse {
    accessToken: string;
    refreshToken: string;
}

// Interface cho dữ liệu sau khi giải mã token
interface DecodedToken {
    UserId: string;
    Name: string;
    Email: string;
    Phone: string;
    Role: string;
    exp: number;
    iss: string;
    aud: string;
}

const API_BASE_URL = "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api";

class AuthService {
    private static instance: AuthService;
    private token: string | null = null;

    private constructor() { }

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    // 🟢 Đăng nhập
    async login(credentials: LoginCredentials): Promise<LoginResponse> {
        try {
            const response = await axios.post<LoginResponse>(`${API_BASE_URL}/Auth/Login`, credentials);
            
            console.log("Raw API Response:", response.data);
    
            if (response.data.accessToken) {
                this.token = response.data.accessToken; // Use accessToken instead of token
                localStorage.setItem("token", response.data.accessToken);
                
                // Add debug logs
                console.log("Token being decoded:", this.token);
                const decoded = this.decodeToken();
                console.log("Decoded result:", decoded);
            }
    
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Login Error:", error.response?.data);
                const message = error.response?.data?.message || "Invalid email or password";
                throw new Error(message);
            }
            throw error;
        }
    }

    // 🟢 Đăng ký
    async register(credentials: RegisterCredentials): Promise<any> {
        try {
            const user = {
                fullName: credentials.fullName,
                phone: credentials.phone,
                email: credentials.email,
                password: credentials.password,
                avatarUrl: credentials.avatarUrl || "", // Nếu không có avatarUrl, truyền chuỗi rỗng
                role: credentials.role || 2, // Mặc định là 2 nếu không truyền
            };

            console.log("Register Data:", user);  // In ra dữ liệu để kiểm tra

            const response = await axios.post(`${API_BASE_URL}/Auth/Register`, user);

            if (response.data.accessToken) {
                this.token = response.data.accessToken;
                localStorage.setItem("token", response.data.accessToken);
                this.decodeToken(); // Giải mã và lưu thông tin token
            }

            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.message || 'Registration failed';
                console.error('Registration error:', errorMessage);
                console.error('Error response:', error.response?.data);
                throw new Error(errorMessage);
            }
            throw error;
        }
    }

    // 🟢 Đăng xuất
    logout(): void {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("decodedToken");
        this.token = null;
    }

    // 🟢 Lấy Token
    getToken(): string | null {
        if (!this.token) {
            this.token = localStorage.getItem("token");
        }
        return this.token;
    }

    // 🟢 Kiểm tra người dùng có đăng nhập không
    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    // 🟢 Lấy thông tin người dùng hiện tại
    getCurrentUser(): any {
        const decodedToken = this.getDecodedToken();
        if (decodedToken) {
            return {
                id: decodedToken.UserId,
                name: decodedToken.Name,
                email: decodedToken.Email,
                phone: decodedToken.Phone,
                role: decodedToken.Role
            };
        }
        return null;
    }

    // 🟢 Giải mã Token và lưu thông tin
    decodeToken(): DecodedToken | null {
        const token = this.getToken();
        if (token) {
            try {
                const decoded: DecodedToken = jwtDecode(token);
                localStorage.setItem("decodedToken", JSON.stringify(decoded));
                return decoded;
            } catch (error) {
                console.error("Error decoding token:", error);
                return null;
            }
        }
        return null;
    }

    // 🟢 Lấy thông tin đã giải mã từ LocalStorage
    getDecodedToken(): DecodedToken | null {
        const decodedStr = localStorage.getItem("decodedToken");
        if (decodedStr) {
            return JSON.parse(decodedStr) as DecodedToken;
        }
        return null;
    }

    // 🟢 Kiểm tra token có hết hạn không
    isTokenExpired(): boolean {
        const decoded = this.getDecodedToken();
        if (decoded) {
            const currentTime = Math.floor(Date.now() / 1000); // Chuyển thời gian hiện tại thành giây
            return decoded.exp < currentTime;
        }
        return true; // Nếu không có token hoặc không giải mã được, coi như đã hết hạn
    }
}

export default AuthService.getInstance();