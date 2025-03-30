import React, { useEffect, useState } from "react";
import { Table, Button, Tag, Pagination, message, Modal, Select } from "antd";
import type { ColumnsType } from "antd/es/table";
import axios, { AxiosError } from "axios";
import { ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Option } = Select;

const API_BASE_URL =
    "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api";

interface Therapist {
    therapistId: string;
    therapistName: string;
}

interface TherapistSpecification {
    therapistId: string;
    specificationId: string;
    status: number;
    therapist: Therapist;
}

const statusMap: Record<number, { color: string; icon: React.ReactNode }> = {
    1: { color: "gold", icon: <ClockCircleOutlined /> },    // Pending
    0: { color: "green", icon: <CheckCircleOutlined /> },   // Active
    2: { color: "red", icon: <CloseCircleOutlined /> },     // Inactive
};

const ManageTherapistSpecification: React.FC = () => {
    const [therapistSpecifications, setTherapistSpecifications] = useState<TherapistSpecification[]>([]);
    const [filteredSpecifications, setFilteredSpecifications] = useState<TherapistSpecification[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedSpec, setSelectedSpec] = useState<TherapistSpecification | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<number>(1);
    const [therapistFilter, setTherapistFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [therapistNames, setTherapistNames] = useState<Therapist[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const pageSize = 10;

    const fetchTherapistSpecifications = async () => {
        setIsLoading(true);
        try {
            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken) {
                message.error("Unauthorized: Please log in again.");
                return;
            }

            const headers = { Authorization: `Bearer ${accessToken}` };
            const response = await axios.get<TherapistSpecification[]>(
                `${API_BASE_URL}/Specification/Get_All_Therapist_Specification`,
                { headers }
            );

            setTherapistSpecifications(response.data);
            setFilteredSpecifications(response.data);

            const uniqueTherapists = Array.from(
                new Map(response.data.map(spec => [spec.therapist.therapistId, spec.therapist])).values()
            );
            setTherapistNames(uniqueTherapists);
        } catch (error) {
            const err = error as AxiosError<{ message?: string }>;
            console.error("Error fetching therapist specifications:", err.response?.data || err.message);
            message.error("Failed to load therapist specifications!");
        } finally {
            setIsLoading(false);
        }
    };

    const updateSpecificationStatus = async (therapistId: string, specificationId: string, status: number) => {
        try {
            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken) {
                message.error("Unauthorized: Please log in again.");
                return;
            }

            const headers = {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            };

            const payload = {
                therapistId,
                specificationId,
                status
            };

            await axios.post(
                `${API_BASE_URL}/Specification/Update_Therapist_Specification_Status`,
                payload,
                { headers }
            );

            message.success("Specification status updated successfully!");

            setTherapistSpecifications(prevSpecs =>
                prevSpecs.map(spec =>
                    spec.therapistId === therapistId && spec.specificationId === specificationId
                        ? { ...spec, status }
                        : spec
                )
            );
            setFilteredSpecifications(prevSpecs =>
                prevSpecs.map(spec =>
                    spec.therapistId === therapistId && spec.specificationId === specificationId
                        ? { ...spec, status }
                        : spec
                )
            );

            setIsModalVisible(false);
        } catch (error) {
            const err = error as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;
            const errorMessage =
                err.response?.data?.message ||
                (err.response?.data?.errors
                    ? Object.values(err.response.data.errors)
                        .flat()
                        .join(", ")
                    : "Failed to update specification status!");
            message.error(errorMessage);
        }
    };

    const showUpdateModal = (record: TherapistSpecification) => {
        setSelectedSpec(record);
        setSelectedStatus(record.status);
        setIsModalVisible(true);
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
        setSelectedSpec(null);
        setSelectedStatus(1);
    };

    const handleStatusUpdate = () => {
        if (selectedSpec && selectedStatus !== null) {
            updateSpecificationStatus(
                selectedSpec.therapistId,
                selectedSpec.specificationId,
                selectedStatus
            );
        }
    };

    const applyFilters = () => {
        let filtered = [...therapistSpecifications];

        if (therapistFilter !== "all") {
            filtered = filtered.filter(spec => spec.therapistId === therapistFilter);
        }

        if (statusFilter !== "all") {
            filtered = filtered.filter(spec => spec.status === parseInt(statusFilter));
        }

        setFilteredSpecifications(filtered);
        setCurrentPage(1);
    };

    const resetFilters = () => {
        setTherapistFilter("all");
        setStatusFilter("all");
        setFilteredSpecifications(therapistSpecifications);
        setCurrentPage(1);
    };

    useEffect(() => {
        fetchTherapistSpecifications();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [therapistFilter, statusFilter, therapistSpecifications]);

    const columns: ColumnsType<TherapistSpecification> = [
        {
            title: "Therapist Name",
            dataIndex: ["therapist", "therapistName"],
            key: "therapistName",
            sorter: (a, b) => a.therapist.therapistName.localeCompare(b.therapist.therapistName)
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            sorter: (a, b) => a.status - b.status,
            render: (status: number) => {
                const { color, icon } = statusMap[status] || { color: "default", icon: null };
                return <Tag color={color} icon={icon} />;
            },
        },
        {
            title: "Action",
            key: "action",
            render: (_, record) => (
                <Button
                    type="primary"
                    size="small"
                    onClick={() => showUpdateModal(record)}
                >
                    Update Status
                </Button>
            ),
        },
    ];

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Manage Therapist Specifications</h2>
                <Button
                    type="primary"
                    onClick={fetchTherapistSpecifications}
                    loading={isLoading}
                >
                    Refresh
                </Button>
            </div>

            <div className="flex flex-wrap gap-4 mb-4">
                <div>
                    <span className="mr-2">Therapist:</span>
                    <Select
                        value={therapistFilter}
                        onChange={setTherapistFilter}
                        style={{ width: 200 }}
                        loading={isLoading}
                    >
                        <Option value="all">All Therapists</Option>
                        {therapistNames.map(therapist => (
                            <Option key={therapist.therapistId} value={therapist.therapistId}>
                                {therapist.therapistName}
                            </Option>
                        ))}
                    </Select>
                </div>
                <div>
                    <span className="mr-2">Status:</span>
                    <Select
                        value={statusFilter}
                        onChange={setStatusFilter}
                        style={{ width: 150 }}
                    >
                        <Option value="all">All Status</Option>
                        <Option value="1">Pending</Option>
                        <Option value="0">Active</Option>
                        <Option value="2">Inactive</Option>
                    </Select>
                </div>
                <Button onClick={resetFilters}>Reset Filters</Button>
            </div>

            <Table
                columns={columns}
                dataSource={filteredSpecifications.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
                pagination={false}
                bordered
                rowKey={record => `${record.therapistId}-${record.specificationId}`}
                loading={isLoading}
            />

            <div className="flex justify-end mt-4">
                <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={filteredSpecifications.length}
                    onChange={(page) => setCurrentPage(page)}
                    showSizeChanger={false}
                />
            </div>

            <Modal
                title={`Update Status for ${selectedSpec?.therapist.therapistName || 'Therapist'}`}
                open={isModalVisible}
                onCancel={handleModalCancel}
                footer={[
                    <Button key="cancel" onClick={handleModalCancel}>
                        Cancel
                    </Button>,
                    <Button key="update" type="primary" onClick={handleStatusUpdate}>
                        Update Status
                    </Button>,
                ]}
            >
                {selectedSpec && (
                    <div>
                        <p><strong>Therapist:</strong> {selectedSpec.therapist.therapistName}</p>
                        <div className="mt-4">
                            <p><strong>Select New Status:</strong></p>
                            <Select
                                value={selectedStatus}
                                onChange={setSelectedStatus}
                                style={{ width: '100%' }}
                            >
                                <Option value={1}>
                                    <Tag color="gold" icon={<ClockCircleOutlined />}>Pending</Tag>
                                </Option>
                                <Option value={0}>
                                    <Tag color="green" icon={<CheckCircleOutlined />}>Active</Tag>
                                </Option>
                                <Option value={2}>
                                    <Tag color="red" icon={<CloseCircleOutlined />}>Inactive</Tag>
                                </Option>
                            </Select>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ManageTherapistSpecification;