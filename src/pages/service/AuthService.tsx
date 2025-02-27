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
    role?: string; // Role mặc định là "USER" nếu không truyền
}

interface LoginResponse {
    accessToken: string;
    refreshToken: string;
}

// Interface mới để khớp với token từ backend
interface DecodedToken {
    UserId: string;
    Name: string;
    Email: string;
    Phone: string;
    Role: string;
    Avatar: string;
    exp: number;
}

const API_BASE_URL = "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api";

class AuthService {
    private static instance: AuthService;
    private token: string | null = null;

    private constructor() {}

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

                if (decoded) {
                    console.log("User role:", decoded.Role);
                    localStorage.setItem("user", JSON.stringify(decoded));
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
                role: credentials.role || "USER",
            };

            console.log("Register Data:", user);

            const response = await axios.post(`${API_BASE_URL}/Auth/Register`, user);

            if (response.data.accessToken) {
                this.token = response.data.accessToken;
                localStorage.setItem("token", response.data.accessToken);
                localStorage.setItem("user", JSON.stringify(response.data.user));
                const decoded = this.decodeToken();

                if (decoded) {
                    console.log("Registered User Role:", decoded.Role);
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

    // 🟢 Giải mã Token và lưu thông tin
    decodeToken(): DecodedToken | null {
        const token = this.getToken();
        if (token) {
            try {
                const decoded: any = jwtDecode(token);

                const formattedToken: DecodedToken = {
                    UserId: decoded.UserId || "",
                    Name: decoded.Name || "",
                    Email: decoded.Email || "",
                    Phone: decoded.Phone || "",
                    Role: decoded.Role || "USER",
                    Avatar: decoded.Avatar || "",
                    exp: decoded.exp || 0,
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
        return decoded?.Role || null;
    }

    // 🟢 Lấy thông tin người dùng hiện tại từ token
    getCurrentUser(): DecodedToken | null {
        return this.getDecodedToken();
    }
}

export default AuthService.getInstance();
