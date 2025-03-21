import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Select, message } from "antd";
import axios, { AxiosError } from "axios";

const API_BASE_URL =
    "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api";

interface Specification {
    specificationId: string;
    name: string;
    description: string;
    level: number;
}

interface Therapist {
    therapistId: string;
    therapistName: string;
    specifications: Specification[];
    key?: string;
}

interface UpdateResponse {
    therapistId: string;
    specificationId: string;
    status: number;
}

const UpdateSpecification: React.FC = () => {
    const [therapists, setTherapists] = useState<Therapist[]>([]);
    const [allSpecifications, setAllSpecifications] = useState<Specification[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedTherapistId, setSelectedTherapistId] = useState<string | null>(null);
    const [selectedSpecificationId, setSelectedSpecificationId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Fetch all therapists
    const fetchTherapists = async () => {
        try {
            setLoading(true);
            const response = await axios.get<Therapist[]>(
                `${API_BASE_URL}/Therapist/Get_All_Therapists`
            );
            const updatedTherapists = response.data.map(therapist => ({
                ...therapist,
                key: therapist.therapistId
            }));
            setTherapists(updatedTherapists);
            console.log("Fetched therapists:", updatedTherapists); // Debug log
        } catch {
            message.error("Failed to load therapists");
        } finally {
            setLoading(false);
        }
    };

    // Fetch all specifications
    const fetchAllSpecifications = async () => {
        try {
            const response = await axios.get<Specification[]>(
                `${API_BASE_URL}/Specification/Get_All_Specification`
            );
            setAllSpecifications(response.data);
            console.log("Fetched specifications:", response.data); // Debug log
        } catch {
            message.error("Failed to load specifications");
        }
    };

    // Update specification
    const updateSpecification = async () => {
        if (!selectedTherapistId || !selectedSpecificationId) {
            message.error("Please select both therapist and specification");
            return;
        }

        try {
            const accessToken = localStorage.getItem("accessToken");
            const headers = {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            };

            const payload = {
                therapistId: selectedTherapistId,
                specificationId: selectedSpecificationId
            };

            const response = await axios.post<UpdateResponse>(
                `${API_BASE_URL}/Specification/Update_Therapist_Specification`,
                payload,
                { headers }
            );

            console.log("Update response:", response.data); // Debug log
            message.success(`Specification updated successfully. Status: ${response.data.status}`);
            setIsModalVisible(false);
            await fetchTherapists(); // Refresh the therapist list
        } catch (error) {
            const err = error as AxiosError<{ message?: string }>;
            message.error(err.response?.data?.message || "Failed to update specification");
        }
    };

    // Show modal for specific therapist
    const showModal = (therapistId: string) => {
        setSelectedTherapistId(therapistId);
        setSelectedSpecificationId(null);
        setIsModalVisible(true);
    };

    useEffect(() => {
        fetchTherapists();
        fetchAllSpecifications();
    }, []);

    // Table columns
    const columns = [
        {
            title: "Therapist Name",
            dataIndex: "therapistName",
            key: "therapistName"
        },
        {
            title: "Current Specifications",
            dataIndex: "specifications",
            key: "specifications",
            render: (specifications: Specification[]) => {
                return specifications.map(spec => spec.name).join(", ") || "None";
            }
        },
        {
            title: "Action",
            key: "action",
            render: (_: unknown, record: Therapist) => (
                <Button onClick={() => showModal(record.therapistId)}>
                    View/Edit Specifications
                </Button>
            )
        }
    ];

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Update Therapist Specifications</h2>

            <Table
                columns={columns}
                dataSource={therapists}
                loading={loading}
                pagination={false}
                bordered
            />

            <Modal
                title="Manage Specifications"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={[
                    <Button key="cancel" onClick={() => setIsModalVisible(false)}>
                        Cancel
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        onClick={updateSpecification}
                        disabled={!selectedSpecificationId}
                    >
                        Update
                    </Button>
                ]}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block mb-1">Select Specification:</label>
                        <Select
                            style={{ width: "100%" }}
                            placeholder="Choose a specification"
                            value={selectedSpecificationId}
                            onChange={(value: string) => setSelectedSpecificationId(value)}
                        >
                            {allSpecifications.map(spec => (
                                <Select.Option
                                    key={spec.specificationId}
                                    value={spec.specificationId}
                                >
                                    {spec.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default UpdateSpecification;