import axios from "axios";
import { jwtDecode } from "jwt-decode";

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
    id: string;
    email: string;
    role: string; // Role là string, không phải number
    exp: number; // Thời gian hết hạn của token
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
                this.token = response.data.accessToken;
                localStorage.setItem("token", response.data.accessToken);

                console.log("Token being decoded:", this.token);
                const decoded = this.decodeToken();
                console.log("Decoded result:", decoded);

                // Log role
                if (decoded) {
                    console.log("User role:", decoded.role);
                }
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
                avatarUrl: credentials.avatarUrl || "",
                role: credentials.role || 2,
            };

            console.log("Register Data:", user);

            const response = await axios.post(`${API_BASE_URL}/Auth/Register`, user);

            if (response.data.token) {
                this.token = response.data.token;
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("user", JSON.stringify(response.data.user));
                const decoded = this.decodeToken();

                if (decoded) {
                    console.log("Registered User Role:", decoded.role);
                }
            }

            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.message || "Registration failed";
                console.error("Registration error:", errorMessage);
                console.error("Error response:", error.response?.data);
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
        const userStr = localStorage.getItem("user");
        if (userStr) {
            return JSON.parse(userStr);
        }
        return null;
    }

    // 🟢 Giải mã Token và lưu thông tin
    decodeToken(): DecodedToken | null {
        const token = this.getToken();
        if (token) {
            try {
                const decoded: any = jwtDecode(token);

                const formattedToken: DecodedToken = {
                    id: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/sid"] || "",
                    email: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || "",
                    role: decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || "USER", // Mặc định là "USER" nếu không có
                    exp: decoded.exp || 0
                };

                localStorage.setItem("decodedToken", JSON.stringify(formattedToken));
                return formattedToken;
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
            const currentTime = Math.floor(Date.now() / 1000);
            return decoded.exp < currentTime;
        }
        return true;
    }

    // 🟢 Lấy role của user
    getUserRole(): string | null {
        const decoded = this.getDecodedToken();
        return decoded?.role || null;
    }
}

export default AuthService.getInstance();
