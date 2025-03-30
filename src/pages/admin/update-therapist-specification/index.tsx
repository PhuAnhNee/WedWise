import { Component } from "react";
import { Table, Button, Modal, Select, message } from "antd";
import axios, { AxiosError } from "axios";

const API_BASE_URL =
    "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api";

interface Specification {
    specificationId: string;
    name: string;
    description: string;
    level: number;
    status?: number;
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

interface SpecificationResponse {
    specificationName: string;
    therapists: {
        therapistId: string;
        therapistName: string;
    }[];
}

type Props = Record<string, never>;

interface State {
    therapists: Therapist[];
    isModalVisible: boolean;
    selectedTherapistId: string | null;
    selectedSpecificationId: string | null;
    selectedStatus: number | null;
    loading: boolean;
    updating: boolean;
}

class UpdateSpecification extends Component<Props, State> {
    state: State = {
        therapists: [],
        isModalVisible: false,
        selectedTherapistId: null,
        selectedSpecificationId: null,
        selectedStatus: null,
        loading: false,
        updating: false
    };

    componentDidMount() {
        this.fetchData();
    }

    fetchData = async () => {
        try {
            this.setState({ loading: true });

            // Fetch therapists
            const therapistResponse = await axios.get<Therapist[]>(
                `${API_BASE_URL}/Therapist/Get_All_Therapists`
            );
            const basicTherapists = therapistResponse.data.map(therapist => ({
                therapistId: therapist.therapistId,
                therapistName: therapist.therapistName,
                specifications: therapist.specifications || [],
                key: therapist.therapistId
            }));
            console.log("Fetched therapists:", basicTherapists);

            // Fetch specifications
            const specResponse = await axios.get<SpecificationResponse[]>(
                `${API_BASE_URL}/Specification/Get_All_Specification`
            );
            const specData = specResponse.data;
            console.log("Fetched specifications:", specData);

            // Map specifications to therapists
            const updatedTherapists = basicTherapists.map(therapist => {
                const matchingSpecs = specData
                    .filter(spec => spec.therapists.some(t => t.therapistId === therapist.therapistId))
                    .map(spec => {
                        const generatedSpecId = `${spec.specificationName}-${therapist.therapistId}`;
                        console.warn(
                            "Generated specificationId:",
                            generatedSpecId,
                            "Verify if this matches what the API expects."
                        );
                        return {
                            specificationId: generatedSpecId, // Use this instead of fallback
                            name: spec.specificationName,
                            description: "No description",
                            level: 0,
                            status: therapist.specifications.find(s => s.name === spec.specificationName)?.status
                        };
                    });
                return {
                    ...therapist,
                    specifications: matchingSpecs.length > 0 ? matchingSpecs : therapist.specifications
                };
            });

            this.setState({ therapists: updatedTherapists });
            console.log("Updated therapists with specifications:", updatedTherapists);
        } catch (error) {
            const err = error as AxiosError<{ message?: string }>;
            console.error("Error fetching data:", err.response?.status, err.message);
            message.error("Failed to load data.");
        } finally {
            this.setState({ loading: false });
        }
    };

    updateSpecificationStatus = async () => {
        const { selectedTherapistId, selectedSpecificationId, selectedStatus } = this.state;
        if (!selectedTherapistId || !selectedSpecificationId || selectedStatus === null) {
            message.error("Please select a specification and status");
            return;
        }

        try {
            this.setState({ updating: true });
            const accessToken = localStorage.getItem("accessToken");
            const headers = {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            };

            const payload = {
                therapistId: selectedTherapistId,
                specificationId: selectedSpecificationId,
                status: selectedStatus
            };

            console.log("Sending update request with payload:", payload);

            const response = await axios.post<UpdateResponse>(
                `${API_BASE_URL}/Specification/Update_Therapist_Specification_Status`,
                payload,
                { headers }
            );

            console.log("Update response:", response.data);
            message.success(`Specification status updated to ${selectedStatus === 0 ? "Active" : selectedStatus === 1 ? "Pending" : "Reject"}`);
            this.setState({ isModalVisible: false });
            await this.fetchData();
        } catch (error) {
            const err = error as AxiosError<{ message?: string }>;
            console.error("Update error:", err.response?.status, err.response?.data);
            message.error(err.response?.data?.message || "Failed to update specification status");
        } finally {
            this.setState({ updating: false });
        }
    };

    showModal = (therapistId: string) => {
        this.setState({
            selectedTherapistId: therapistId,
            selectedSpecificationId: null,
            selectedStatus: null,
            isModalVisible: true
        });
    };

    render() {
        const { therapists, isModalVisible, selectedTherapistId, selectedSpecificationId, selectedStatus, loading, updating } = this.state;

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
                render: (specifications: Specification[]) =>
                    specifications
                        .map(spec => `${spec.name} (${spec.status === 0 ? "Active" : spec.status === 1 ? "Pending" : spec.status === 2 ? "Reject" : "Unknown"})`)
                        .join(", ") || "None"
            },
            {
                title: "Action",
                key: "action",
                render: (_: unknown, record: Therapist) => (
                    <Button onClick={() => this.showModal(record.therapistId)}>
                        Update Status
                    </Button>
                )
            }
        ];

        const selectedTherapist = therapists.find(t => t.therapistId === selectedTherapistId);

        return (
            <div className="p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">Update Therapist Specification Status</h2>

                <Table
                    columns={columns}
                    dataSource={therapists}
                    loading={loading}
                    pagination={false}
                    bordered
                />

                <Modal
                    title="Update Specification Status"
                    open={isModalVisible}
                    onCancel={() => this.setState({ isModalVisible: false })}
                    footer={[
                        <Button key="cancel" onClick={() => this.setState({ isModalVisible: false })}>
                            Cancel
                        </Button>,
                        <Button
                            key="submit"
                            type="primary"
                            onClick={this.updateSpecificationStatus}
                            disabled={!selectedSpecificationId || selectedStatus === null || updating}
                            loading={updating}
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
                                onChange={(value: string) => this.setState({ selectedSpecificationId: value })}
                            >
                                {selectedTherapist?.specifications && selectedTherapist.specifications.length > 0 ? (
                                    selectedTherapist.specifications.map((spec, index) => (
                                        <Select.Option
                                            key={spec.specificationId || `fallback-${index}`} // Fallback only if spec.specificationId is invalid
                                            value={spec.specificationId}
                                        >
                                            {spec.name} (Current: {spec.status === 0 ? "Active" : spec.status === 1 ? "Pending" : spec.status === 2 ? "Reject" : "Unknown"})
                                        </Select.Option>
                                    ))
                                ) : (
                                    <Select.Option key="no-specs" disabled>
                                        No specifications available
                                    </Select.Option>
                                )}
                            </Select>
                        </div>
                        <div>
                            <label className="block mb-1">Select Status:</label>
                            <Select
                                style={{ width: "100%" }}
                                placeholder="Choose a status"
                                value={selectedStatus}
                                onChange={(value: number) => this.setState({ selectedStatus: value })}
                            >
                                <Select.Option value={0}>Active</Select.Option>
                                <Select.Option value={1}>Pending</Select.Option>
                                <Select.Option value={2}>Reject</Select.Option>
                            </Select>
                        </div>
                    </div>
                </Modal>
            </div>
        );
    }
}

export default UpdateSpecification;