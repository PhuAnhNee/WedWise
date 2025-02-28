import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomMessage from "../../../component/message/index";

// Hàm giải mã JWT để lấy payload
const decodeJWT = (token: string) => {
    try {
        const base64Url = token.split(".")[1]; // Lấy phần payload từ JWT
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error("❌ Error decoding JWT:", error);
        return null;
    }
};

const AdminLogin: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<{ type: "success" | "error" | "warning"; text: string } | null>(null);
    const navigate = useNavigate();

    const onSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setMessage(null); // Xóa thông báo cũ trước khi gửi yêu cầu

        const formData = new FormData(event.target as HTMLFormElement);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        try {
            const response = await fetch(
                "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Auth/Login",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                }
            );

            const data = await response.json();
            console.log("📌 API Response:", data);

            if (response.ok) {
                const accessToken = data.accessToken;

                if (!accessToken || typeof accessToken !== "string") {
                    console.error("❌ accessToken không hợp lệ:", accessToken);
                    setMessage({ type: "error", text: "Lỗi hệ thống: Token không hợp lệ!" });
                    return;
                }

                // Giải mã token để lấy payload
                const decodedToken = decodeJWT(accessToken);
                if (!decodedToken) {
                    setMessage({ type: "error", text: "Không thể giải mã token!" });
                    return;
                }

                console.log("📌 Decoded Token:", decodedToken);

                // Kiểm tra role trong payload
                const role = decodedToken.Role || decodedToken.role; // Một số hệ thống có thể dùng "role" thay vì "Role"
                if (role !== "ADMIN") {
                    setMessage({ type: "error", text: "Bạn không phải là admin!" });
                    return;
                }

                // Xóa token cũ trước khi lưu token mới
                localStorage.removeItem("accessToken");
                localStorage.setItem("accessToken", accessToken);
                console.log("✅ Access Token đã lưu:", localStorage.getItem("accessToken"));

                setMessage({ type: "success", text: "Đăng nhập thành công!" });

                // Chuyển hướng sau 2 giây nếu thành công
                setTimeout(() => {
                    navigate("/admin/dashboard");
                }, 2000);
            } else {
                setMessage({ type: "error", text: data.message || "Email hoặc mật khẩu không đúng!" });
            }
        } catch (error) {
            console.error("❌ Lỗi đăng nhập:", error);
            setMessage({ type: "error", text: "Lỗi kết nối, vui lòng thử lại!" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-400 to-purple-500">
            {message && <CustomMessage type={message.type} message={message.text} onClose={() => setMessage(null)} />}

            <div className="bg-white rounded-lg shadow-lg flex overflow-hidden max-w-4xl w-full">
                {/* Image Section */}
                <div className="hidden md:block w-1/2">
                    <img
                        src="https://i.pinimg.com/736x/d8/ab/ba/d8abba4b4fd6857b214aa357da816308.jpg"
                        alt="Admin login"
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Form Section */}
                <div className="w-full md:w-1/2 p-8">
                    <h2 className="text-2xl font-bold text-center mb-6">Login as Admin User</h2>
                    <form onSubmit={onSubmit} className="space-y-4 mt-[100px] mb-[130px]">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                name="email"
                                required
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter your email"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <input
                                type="password"
                                name="password"
                                required
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter your password"
                            />
                        </div>

                        <div className="text-center">
                            <a href="#" className="text-sm text-blue-500 hover:underline">
                                Forgot your password?
                            </a>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
                                disabled={loading}
                            >
                                {loading ? "Logging in..." : "Log In"}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-600">
                        <a href="#" className="text-blue-500 hover:underline">
                            Terms of use
                        </a>
                        <span className="mx-2">|</span>
                        <a href="#" className="text-blue-500 hover:underline">
                            Privacy policy
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;