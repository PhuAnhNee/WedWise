import { useState } from "react"; // Removed unused useRef
import { Card, Button, Form, Input } from "antd";
import { EditOutlined } from "@ant-design/icons";
import axios from "axios";
import AuthService from "../../service/AuthService";
import UploadImage from "./UploadImage";

interface Certificate {
  certificateId: string;
  therapistId: string;
  certificateName: string;
  certificateUrl: string;
}

interface CertificateCardProps {
  certificate: Certificate | null;
  setCertificate: (certificate: Certificate | null) => void;
  therapistId: string | undefined;
  fetchCertificate: () => Promise<void>;
  handleFileUpload: (file: File) => Promise<string | null>;
  showNotification: (type: "success" | "error", message: string, description: string) => void;
}

const CertificateCard: React.FC<CertificateCardProps> = ({
  certificate,
  setCertificate,
  therapistId,
  fetchCertificate,
  handleFileUpload,
  showNotification,
}) => {
  const [editingCertificate, setEditingCertificate] = useState(false);
  const [isCreatingCertificate, setIsCreatingCertificate] = useState(!certificate);
  const [isUploadingCertificate, setIsUploadingCertificate] = useState(false);
  const [certificateForm] = Form.useForm();

  const handleCreateCertificate = async (values: { certificateName: string; certificateUrl: string }) => {
    const token = AuthService.getToken();
    if (!token || !therapistId) {
      showNotification("error", "Error", "Missing token or therapist ID. Please log in again.");
      return;
    }
    try {
      await axios.post(
        "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Certificate/Create_Certificate",
        { therapistId, ...values },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      await fetchCertificate();
      certificateForm.resetFields();
      setEditingCertificate(false);
      setIsCreatingCertificate(false);
      showNotification("success", "Success", "Certificate created successfully!");
    } catch (error) {
      showNotification("error", "Error", "Unable to create certificate");
    }
  };

  const handleUpdateCertificate = async (values: { certificateName: string; certificateUrl: string }) => {
    const token = AuthService.getToken();
    if (!token || !therapistId || !certificate?.certificateId) {
      showNotification("error", "Error", "Missing token, therapist ID, or certificate ID. Please try again.");
      return;
    }
    try {
      await axios.post(
        "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Certificate/Update_Certificate",
        { certificateId: certificate.certificateId, therapistId, ...values },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      await fetchCertificate();
      setEditingCertificate(false);
      setIsCreatingCertificate(false);
      showNotification("success", "Success", "Certificate updated successfully!");
    } catch (error) {
      showNotification("error", "Error", "Unable to update certificate");
    }
  };

  return (
    <Card
      className="w-full max-w-md"
      style={{ background: "#ffffff", borderRadius: "16px", boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)", padding: "24px" }}
    >
      <h2 className="text-2xl font-semibold mb-6 text-gray-900 text-center">
        {isCreatingCertificate && !certificate ? "Create Certificate" : "Certificate"}
      </h2>
      {editingCertificate ? (
        <Form
          form={certificateForm}
          layout="vertical"
          onFinish={isCreatingCertificate ? handleCreateCertificate : handleUpdateCertificate}
          className="space-y-6"
        >
          <Form.Item
            label="Certificate Image"
            name="certificateUrl"
            rules={[{ required: true, message: "Please upload or enter certificate URL" }]}
          >
            <UploadImage
                imageUrl={certificate?.certificateUrl}
                onImageChange={(url) => {
                    certificateForm.setFieldsValue({ certificateUrl: url });
                    setCertificate(
                    certificate
                        ? { ...certificate, certificateUrl: url }
                        : { certificateId: "", therapistId: therapistId || "", certificateName: "", certificateUrl: url }
                    );
                }}
                handleFileUpload={handleFileUpload}
                setIsUploading={setIsUploadingCertificate}
                isUploading={isUploadingCertificate}
                placeholderText="C"
                />
          </Form.Item>
          <Form.Item
            label="Certificate Name"
            name="certificateName"
            rules={[{ required: true, message: "Please enter certificate name" }]}
          >
            <Input size="large" placeholder="Enter certificate name" />
          </Form.Item>
          <div className="flex justify-center space-x-6 mt-4">
            <Button size="large" onClick={() => setEditingCertificate(false)}>
              Cancel
            </Button>
            <Button size="large" type="primary" htmlType="submit">
              {isCreatingCertificate ? "Add Certificate" : "Update Certificate"}
            </Button>
          </div>
        </Form>
      ) : certificate ? (
        <div className="text-center space-y-4">
          <p className="text-gray-700 text-lg font-medium">{certificate.certificateName}</p>
          <img
            src={certificate.certificateUrl}
            alt={certificate.certificateName}
            style={{ maxWidth: "100%", height: "auto", borderRadius: "8px" }}
          />
          <Button
            size="large"
            icon={<EditOutlined />}
            onClick={() => {
              certificateForm.setFieldsValue(certificate);
              setEditingCertificate(true);
              setIsCreatingCertificate(false);
            }}
          >
            Update Certificate
          </Button>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <p className="text-gray-500">No certificate available</p>
          <Button
            size="large"
            icon={<EditOutlined />}
            onClick={() => {
              certificateForm.resetFields();
              setEditingCertificate(true);
              setIsCreatingCertificate(true);
            }}
          >
            Add Certificate
          </Button>
        </div>
      )}
    </Card>
  );
};

export default CertificateCard;