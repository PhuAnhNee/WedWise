import { useEffect, useState } from "react";
import { Spin, Button, Select, Modal } from "antd";
import axios from "axios";
import AuthService from "../../service/AuthService";

const { Option } = Select;

interface Specification {
  specificationId: string;
  name: string;
  description: string;
  level: number;
  therapists?: { therapistId: string }[];
}

interface SpecificationListProps {
  therapistId: string;
  showNotification: (type: "success" | "error", message: string, description: string) => void;
}

const SpecificationList = ({ therapistId, showNotification }: SpecificationListProps) => {
  const [specifications, setSpecifications] = useState<Specification[]>([]);
  const [allSpecifications, setAllSpecifications] = useState<Specification[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestLoading, setRequestLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedSpecId, setSelectedSpecId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1); 
  const itemsPerPage = 4; 

  const fetchSpecifications = async () => {
    if (!therapistId) {
      showNotification("error", "Error", "Therapist ID not found");
      setLoading(false);
      return;
    }

    try {
      const token = AuthService.getToken();
      const { data } = await axios.get<Specification[]>(
        `https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Specification/Get_Specification_By_Therapist_Id?id=${therapistId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setSpecifications(data);
    } catch (error) {
      console.error("Error fetching specifications:", error);
      showNotification("error", "Error", "Unable to load specifications");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllSpecifications = async () => {
    try {
      const { data } = await axios.get<Specification[]>(
        "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Specification/Get_All_Specification_With_Level"
      );
      setAllSpecifications(data);
    } catch (error) {
      console.error("Error fetching all specifications:", error);
      showNotification("error", "Error", "Unable to load available specifications");
    }
  };

  const availableSpecifications = allSpecifications.filter((spec) => {
    if (!spec.therapists) return true;
    return !spec.therapists.some((therapist) => therapist.therapistId === therapistId);
  });

  const handleRequestNewSpecification = async () => {
    if (!therapistId) {
      showNotification("error", "Error", "Therapist ID not found");
      return;
    }

    if (!selectedSpecId) {
      showNotification("error", "Error", "Please select a specification to request");
      return;
    }

    setRequestLoading(true);
    try {
      const token = AuthService.getToken();
      if (!token) {
        showNotification("error", "Error", "Please log in or invalid token");
        return;
      }

      const requestData = {
        therapistId: therapistId,
        specificationId: selectedSpecId,
      };

      await axios.post(
        "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Specification/Update_Therapist_Specification",
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      showNotification("success", "Success", "New specification requested successfully!");
      await fetchSpecifications();
      setIsModalVisible(false);
      setSelectedSpecId(null);
    } catch (error) {
      console.error("Error requesting new specification:", error);
      showNotification("error", "Error", "Unable to request new specification");
    } finally {
      setRequestLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchSpecifications(), fetchAllSpecifications()]);
      setLoading(false);
    };
    fetchData();
  }, [therapistId]);

 
  const totalPages = Math.ceil(specifications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSpecifications = specifications.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-6">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Specializations</h2>
      {specifications.length === 0 ? (
        <p className="text-gray-500">No specializations found.</p>
      ) : (
        <div>
          <ul className="space-y-4">
            {currentSpecifications.map((spec) => (
              <li key={spec.specificationId} className="border-b pb-2">
                <h3 className="text-md font-medium text-gray-700">{spec.name}</h3>
                <p className="text-sm text-gray-500">{spec.description}</p>
                <p className="text-sm text-gray-600">Level: {spec.level}</p>
              </li>
            ))}
          </ul>

          {/* Pagination Controls */}
          {specifications.length > itemsPerPage && (
            <div className="flex justify-between items-center mt-4">
              <Button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                style={{
                  backgroundColor: currentPage === 1 ? "#d3d3d3" : "#595959",
                  borderColor: currentPage === 1 ? "#d3d3d3" : "#595959",
                  color: "white",
                  fontWeight: "bold",
                }}
              >
                Previous
              </Button>
              <div className="flex space-x-2">
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <Button
                    key={page}
                    onClick={() => handlePageClick(page)}
                    style={{
                      backgroundColor: currentPage === page ? "#595959" : "#e5e5e5",
                      color: currentPage === page ? "white" : "black",
                      fontWeight: "bold",
                    }}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                style={{
                  backgroundColor: currentPage === totalPages ? "#d3d3d3" : "#595959",
                  borderColor: currentPage === totalPages ? "#d3d3d3" : "#595959",
                  color: "white",
                  fontWeight: "bold",
                }}
              >
                Next
              </Button>
            </div>
          )}
          {specifications.length > itemsPerPage && (
            <p className="text-center mt-2 text-gray-600">
              Page {currentPage} of {totalPages}
            </p>
          )}
        </div>
      )}
      <div className="mt-4 text-center">
        <Button
          type="primary"
          onClick={() => setIsModalVisible(true)}
          style={{
            background: "#595959",
            borderColor: "#595959",
            fontWeight: "bold",
            padding: "0 28px",
            height: "48px",
          }}
        >
          Request New Specification
        </Button>
      </div>
      <Modal
        title="Request New Specification"
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedSpecId(null);
        }}
        footer={[
          <Button key="cancel" onClick={() => setIsModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={requestLoading}
            onClick={handleRequestNewSpecification}
            disabled={!selectedSpecId}
          >
            Request
          </Button>,
        ]}
      >
        <Select
          style={{ width: "100%" }}
          placeholder="Select a specification"
          onChange={(value: string) => setSelectedSpecId(value)}
          value={selectedSpecId}
        >
          {availableSpecifications.map((spec) => (
            <Option key={spec.specificationId} value={spec.specificationId}>
              {spec.name} (Level: {spec.level})
            </Option>
          ))}
        </Select>
        {availableSpecifications.length === 0 && (
          <p className="text-gray-500 mt-2">No new specifications available to request.</p>
        )}
      </Modal>
    </div>
  );
};

export default SpecificationList;