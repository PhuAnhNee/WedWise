import axios from "axios";

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
    role?: number; // Mặc định là 1 nếu không truyền
}

interface LoginResponse {
    token: string;
    user: {
        id: string;
        email: string;
        // Thêm các trường khác của user nếu cần
    };
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

            if (response.data.token) {
                this.token = response.data.token;
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("user", JSON.stringify(response.data.user));
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
                role: credentials.role || 1, // Mặc định là 1 nếu không truyền
            };

            console.log("Register Data:", user);  // In ra dữ liệu để kiểm tra

            const response = await axios.post(`${API_BASE_URL}/Auth/Register`, user);

            if (response.data.token) {
                this.token = response.data.token;
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("user", JSON.stringify(response.data.user));
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
}

export default AuthService.getInstance();
