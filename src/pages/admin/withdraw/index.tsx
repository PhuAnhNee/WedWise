import React, { useEffect, useState } from "react";
import { Table, Button, Tag, Pagination, message, Modal, List } from "antd";
import type { ColumnsType } from "antd/es/table";
import axios, { AxiosError } from "axios";

const API_BASE_URL =
    "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api";

interface Specification {
    name: string;
    description: string;
    level: number;
}

interface Therapist {
    therapistId: string;
    therapistName: string;
    avatar: string;
    status: boolean;
    description: string;
    consultationFee: number;
    meetUrl: string;
    schedules: {
        scheduleId: string;
        therapistId: string;
        date: string;
        slot: number;
        isAvailable: boolean;
    }[];
    specifications: Specification[];
    createdBy: string;
    updatedBy: string;
    createdAt: string;
    updatedAt: string;
}

interface Certificate {
    certificateId: string;
    therapistId: string;
    certificateName: string;
    certificateUrl: string;
    therapistName?: string; // Optional field for pre-fetched therapist name
}

const TherapistManagement: React.FC = () => {
    const [therapists, setTherapists] = useState<Therapist[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isSpecModalVisible, setIsSpecModalVisible] = useState(false);
    const [isDescModalVisible, setIsDescModalVisible] = useState(false);
    const [isCertModalVisible, setIsCertModalVisible] = useState(false);
    const [selectedSpecifications, setSelectedSpecifications] = useState<Specification[]>([]);
    const [selectedDescription, setSelectedDescription] = useState<string>("");
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const pageSize = 5;

    // Fetch danh sách therapist từ API
    const fetchTherapists = async () => {
        try {
            const response = await axios.get<Therapist[]>(`${API_BASE_URL}/Therapist/Get_All_Therapists`);
            console.log("Therapists from API:", response.data);
            setTherapists(
                response.data.map((therapist) => ({
                    ...therapist,
                    key: therapist.therapistId, // Gán key cho Table
                }))
            );
        } catch (error) {
            const err = error as AxiosError<{ message?: string }>;
            console.error("Error fetching therapists:", err.response?.data || err.message);
            message.error("Failed to load therapists!");
        }
    };

    // Fetch danh sách certificates từ API và pre-fetch therapist names
    const fetchCertificates = async () => {
        try {
            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken) {
                message.error("Unauthorized: Please log in again.");
                return;
            }

            const headers = { Authorization: `Bearer ${accessToken}` };
            const response = await axios.get<Certificate[]>(`${API_BASE_URL}/Certificate/Get_All_Certificate`, { headers });
            const certsWithNames = await Promise.all(
                response.data.map(async (cert) => ({
                    ...cert,
                    therapistName: await fetchTherapistName(cert.therapistId),
                }))
            );
            setCertificates(certsWithNames);
            setIsCertModalVisible(true);
        } catch (error) {
            const err = error as AxiosError<{ message?: string }>;
            console.error("Error fetching certificates:", err.response?.data || err.message);
            message.error("Failed to load certificates!");
        }
    };

    // Fetch therapist name by ID
    const fetchTherapistName = async (therapistId: string): Promise<string> => {
        try {
            const accessToken = localStorage.getItem("accessToken");
            const headers = { Authorization: `Bearer ${accessToken}` };
            const response = await axios.get<Therapist>(`${API_BASE_URL}/Therapist/Get_Therapist_By_Id?id=${therapistId}`, { headers });
            return response.data.therapistName || "Unknown";
        } catch (error) {
            console.error("Error fetching therapist name:", error);
            return "Unknown";
        }
    };

    // Xử lý Accept (set status thành true)
    const handleAccept = async (therapist: Therapist) => {
        try {
            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken) {
                message.error("Unauthorized: Please log in again.");
                return;
            }

            const headers = { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };
            const payload = {
                therapistId: therapist.therapistId,
                therapistName: therapist.therapistName || "Unknown",
                avatar: therapist.avatar || "default-avatar.jpg",
                status: true,
                description: therapist.description || "No Description",
                consultationFee: therapist.consultationFee || 0,
                meetUrl: therapist.meetUrl || "No Meet Url",
                schedules: therapist.schedules || [],
                specifications: therapist.specifications || [],
            };

            console.log("Accept Payload:", payload);
            const response = await axios.post(`${API_BASE_URL}/Therapist/Update_Therapist`, payload, { headers });
            console.log("Accept Therapist Response:", response.data);
            message.success("Therapist accepted successfully!");
            fetchTherapists();
        } catch (error) {
            const err = error as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;
            console.error("Error accepting therapist:", err.response?.data || err.message);
            const errorMessage =
                err.response?.data?.message ||
                (err.response?.data?.errors
                    ? Object.values(err.response.data.errors)
                        .flat()
                        .join(", ")
                    : "Failed to accept therapist!");
            message.error(errorMessage);
        }
    };

    // Xử lý Decline (set status thành false)
    const handleDecline = async (therapist: Therapist) => {
        try {
            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken) {
                message.error("Unauthorized: Please log in again.");
                return;
            }

            const headers = { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };
            const payload = {
                therapistId: therapist.therapistId,
                therapistName: therapist.therapistName || "Unknown",
                avatar: therapist.avatar || "default-avatar.jpg",
                status: false,
                description: therapist.description || "No Description",
                consultationFee: therapist.consultationFee || 0,
                meetUrl: therapist.meetUrl || "No Meet Url",
                schedules: therapist.schedules || [],
                specifications: therapist.specifications || [],
            };

            console.log("Decline Payload:", payload);
            const response = await axios.post(`${API_BASE_URL}/Therapist/Update_Therapist`, payload, { headers });
            console.log("Decline Therapist Response:", response.data);
            message.success("Therapist declined successfully!");
            fetchTherapists();
        } catch (error) {
            const err = error as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;
            console.error("Error declining therapist:", err.response?.data || err.message);
            const errorMessage =
                err.response?.data?.message ||
                (err.response?.data?.errors
                    ? Object.values(err.response.data.errors)
                        .flat()
                        .join(", ")
                    : "Failed to decline therapist!");
            message.error(errorMessage);
        }
    };

    // Hiển thị modal với danh sách specifications
    const showSpecificationsModal = (specifications: Specification[]) => {
        console.log("Opening specifications modal with:", specifications);
        setSelectedSpecifications(specifications || []);
        setIsSpecModalVisible(true);
    };

    // Hiển thị modal với description
    const showDescriptionModal = (description: string) => {
        console.log("Opening description modal with:", description);
        setSelectedDescription(description || "No description available");
        setIsDescModalVisible(true);
    };

    const handleSpecModalClose = () => {
        console.log("Closing specifications modal");
        setIsSpecModalVisible(false);
        setSelectedSpecifications([]);
    };

    const handleDescModalClose = () => {
        console.log("Closing description modal");
        setIsDescModalVisible(false);
        setSelectedDescription("");
    };

    const handleCertModalClose = () => {
        console.log("Closing certificates modal");
        setIsCertModalVisible(false);
        setCertificates([]);
    };

    useEffect(() => {
        fetchTherapists();
    }, []);

    // Cột bảng
    const columns: ColumnsType<Therapist> = [
        { title: "Therapist Name", dataIndex: "therapistName", key: "therapistName" },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status: boolean) => {
                const color = status ? "green" : "red";
                return <Tag color={color}>{status ? "Active" : "Inactive"}</Tag>;
            },
        },
        { title: "Consultation Fee", dataIndex: "consultationFee", key: "consultationFee" },
        {
            title: "Specifications",
            key: "specifications",
            render: (_, record) => (
                <Button
                    type="link"
                    onClick={() => showSpecificationsModal(record.specifications || [])}
                >
                    View ({record.specifications?.length || 0})
                </Button>
            ),
        },
        {
            title: "Description",
            key: "description",
            render: (_, record) => (
                <Button
                    type="link"
                    onClick={() => showDescriptionModal(record.description || "")}
                >
                    View
                </Button>
            ),
        },
        {
            title: "Action",
            key: "action",
            render: (_, record) => (
                <div className="flex gap-2">
                    <Button
                        type="primary"
                        size="small"
                        disabled={record.status}
                        onClick={() => handleAccept(record)}
                    >
                        Accept
                    </Button>
                    <Button
                        type="primary"
                        danger
                        size="small"
                        disabled={!record.status}
                        onClick={() => handleDecline(record)}
                    >
                        Decline
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Therapist Management</h2>
                <Button type="primary" onClick={fetchCertificates}>
                    View All Certificates
                </Button>
            </div>
            <Table
                columns={columns}
                dataSource={therapists.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
                pagination={false}
                bordered
            />
            <div className="flex justify-between items-center mt-4">
                <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={therapists.length}
                    onChange={(page) => setCurrentPage(page)}
                    showSizeChanger={false}
                />
            </div>

            {/* Modal hiển thị specifications */}
            <Modal
                title="Therapist Specifications"
                open={isSpecModalVisible}
                onCancel={handleSpecModalClose}
                footer={null}
            >
                <List
                    dataSource={selectedSpecifications}
                    renderItem={(spec) => (
                        <List.Item>
                            <div>
                                <strong>{spec.name}</strong>
                                <p>{spec.description}</p>
                                <p>Level: {spec.level}</p>
                            </div>
                        </List.Item>
                    )}
                    locale={{ emptyText: "No specifications available" }}
                />
            </Modal>

            {/* Modal hiển thị description */}
            <Modal
                title="Therapist Description"
                open={isDescModalVisible}
                onCancel={handleDescModalClose}
                footer={null}
            >
                <p>{selectedDescription}</p>
            </Modal>

            {/* Modal hiển thị certificates */}
            <Modal
                title="All Certificates"
                open={isCertModalVisible}
                onCancel={handleCertModalClose}
                footer={null}
                width={800}
            >
                <List
                    dataSource={certificates}
                    renderItem={(cert) => (
                        <List.Item>
                            <div className="flex justify-between w-full">
                                <span>{cert.therapistName || "Unknown"}</span>
                                <span>{cert.certificateName}</span>
                                <a href={cert.certificateUrl} target="_blank" rel="noopener noreferrer" className='text-blue-600'>
                                    View Certificate
                                </a>
                            </div>
                        </List.Item>
                    )}
                    locale={{ emptyText: "No certificates available" }}
                />
            </Modal>
        </div>
    );
};

export default TherapistManagement;