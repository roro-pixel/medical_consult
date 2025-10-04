import { useState, useEffect } from 'react';
import { usePrescriptions } from '../hooks/usePrescriptions';
import { usePayments } from '../hooks/usePayments';
import { usePatients } from '../hooks/usePatients';
import { useDoctors } from '../hooks/useDoctors';
import { useConsultations } from '../hooks/useConsultations';
import { 
  Table, Button, Modal, Select, Input, Tag, Card, Divider, 
  Descriptions, DatePicker, notification 
} from 'antd';
import { 
  EuroOutlined, SearchOutlined, FilePdfOutlined, 
  MedicineBoxOutlined 
} from '@ant-design/icons';
import type { PrescriptionItem, Consultation, Patient } from '../types/medical';
import dayjs from 'dayjs';

interface Doctor {
  id: string;
  doctor_id: string;
  firstname: string;
  lastname: string;
  fullname: string;
  specialty: string;
  phone: string;
}

interface PaymentFromApi {
  id: string;
  payment_id: string;
  consultation: string;
  consultation_id: string;
  patient_name: string;
  amount: string;
  payment_method: string;
  status: string;
  reference_number: string;
  paid_at: Date | null;
  created_at: Date;
  paymentId?: string;
  consultationId?: string;
  paymentMethod?: string;
  createdAt?: Date;
}

interface PrescriptionFilters {
  search: string;
  dateRange: [dayjs.Dayjs, dayjs.Dayjs] | null;
}

interface PaymentData {
  amount: string;
  method: "cash" | "card" | "insurance";
  reference: string;
}

interface PrescriptionFromApi {
  id: number;
  prescription_id: string;
  consultation_id: string;
  created_at: string;
  items: PrescriptionItem[];
  prescriptionId?: string;
  consultationId?: string;
  createdAt?: Date;
}

interface ConsultationWithApiData extends Consultation {
  patientName?: string;
  doctorName?: string;
  patient?: string; 
  doctor?: string; 
}

const { RangePicker } = DatePicker;

const PrescriptionsPage = () => {
  // Hooks
  const { prescriptions, loading, getPrescriptions } = usePrescriptions();
  const { payments, getPayments, createPayment } = usePayments();
  const { patients } = usePatients();
  const { doctors, fetchDoctors } = useDoctors();
  const { consultations, fetchConsultations } = useConsultations();

  const [filters, setFilters] = useState<PrescriptionFilters>({
    search: '',
    dateRange: null
  });
  const [selectedPrescription, setSelectedPrescription] = useState<PrescriptionFromApi | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData>({
    amount: '',
    method: "cash",
    reference: `PAY-${Date.now().toString().slice(-6)}`
  });

  useEffect(() => {
    const loadData = async () => {
      await getPrescriptions();
      await getPayments();
      await fetchConsultations();
      await fetchDoctors();
    };
    loadData();
  }, [getPrescriptions, getPayments, fetchConsultations, fetchDoctors]);

  const filteredPrescriptions = (prescriptions as PrescriptionFromApi[]).filter((prescription: PrescriptionFromApi) => {
    const matchesSearch = filters.search === '' || 
      prescription.prescription_id.toLowerCase().includes(filters.search.toLowerCase());
    
    if (!filters.dateRange) return matchesSearch;
    
    const prescriptionDate = dayjs(prescription.created_at);
    return matchesSearch && 
      prescriptionDate.isAfter(filters.dateRange[0]) && 
      prescriptionDate.isBefore(filters.dateRange[1]);
  });

  const findConsultationById = (id: string): ConsultationWithApiData | undefined => {
    return consultations.find(c => c.consultationId === id) as ConsultationWithApiData | undefined;
  };

  const findPatientById = (id: string): Patient | undefined => {
    return patients.find(p => p.patientId === id);
  };

  const findDoctorById = (id: string): Doctor | undefined => {
    return doctors.find(d => d.doctor_id === id);
  };

  const handleSelectPrescription = (prescription: PrescriptionFromApi) => {
    setSelectedPrescription(prescription);
    
    const consultation = findConsultationById(prescription.consultation_id);
    if (consultation) {
      const patient = consultation.patient ? findPatientById(consultation.patient) : null;
      const doctor = consultation.doctor ? findDoctorById(consultation.doctor) : null;
      
      setSelectedPatient(patient || null);
      setSelectedDoctor(doctor || null);
    }
  };

  const handlePayment = async () => {
    if (!selectedPrescription) return;

    try {
      await createPayment({
        consultation: selectedPrescription.consultation_id,
        amount: paymentData.amount,
        payment_method: paymentData.method,
        status: "COMPLETED",
        reference_number: paymentData.reference
      });
      
      notification.success({
        message: 'Paiement enregistré',
        description: `${paymentData.amount} XAF payés par ${paymentData.method}`
      });
      setPaymentModalVisible(false);
      getPrescriptions();
    } catch (error: unknown) {
      notification.error({
        message: 'Erreur de paiement',
        description: error instanceof Error ? error.message : 'Une erreur inconnue est survenue'
      });
    }
  };

  const columns = [
    {
      title: 'N° Ordonnance',
      dataIndex: 'prescription_id',
      key: 'id',
      sorter: (a: PrescriptionFromApi, b: PrescriptionFromApi) => 
        a.prescription_id.localeCompare(b.prescription_id),
    },
    {
      title: 'Patient',
      key: 'patient',
      render: (_: unknown, record: PrescriptionFromApi) => {
        const consultation = findConsultationById(record.consultation_id);
        if (consultation?.patientName) {
          return consultation.patientName;
        }
        const patient = consultation?.patient ? findPatientById(consultation.patient) : undefined;
        return patient?.fullName || 'N/A';
      }
    },
    {
      title: 'Médecin',
      key: 'doctor',
      render: (_: unknown, record: PrescriptionFromApi) => {
        const consultation = findConsultationById(record.consultation_id);
        if (consultation?.doctorName) {
          return consultation.doctorName;
        }
        const doctor = consultation?.doctor ? findDoctorById(consultation.doctor) : undefined;
        return doctor?.fullname || 'N/A';
      }
    },
    {
      title: 'Médicaments',
      dataIndex: 'items',
      key: 'items',
      render: (items: PrescriptionItem[]) => (
        <Tag icon={<MedicineBoxOutlined />}>{items.length}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: PrescriptionFromApi) => (
        <div className="flex space-x-2">
          <Button
            size="small"
            icon={<EuroOutlined />}
            onClick={() => {
              handleSelectPrescription(record);
              setPaymentModalVisible(true);
            }}
          >
            Payer
          </Button>
          <Button
            size="small"
            icon={<FilePdfOutlined />}
            onClick={() => generatePDF(record)}
          >
            PDF
          </Button>
        </div>
      ),
    },
  ];

  const generatePDF = (prescription: PrescriptionFromApi) => {
    notification.info({
      message: 'Fonctionnalité PDF',
      description: 'Génération du PDF pour ' + prescription.prescription_id
    });
  };

  return (
    <div className="p-4 space-y-4">
      <Card title="Filtres">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Rechercher..."
            prefix={<SearchOutlined />}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
          />
          <RangePicker
            style={{ width: '100%' }}
            onChange={(dates) => setFilters({...filters, dateRange: dates as [dayjs.Dayjs, dayjs.Dayjs]})}
          />
        </div>
      </Card>

      <Table
        columns={columns}
        dataSource={filteredPrescriptions}
        loading={loading}
        rowKey="prescription_id"
        onRow={(record: PrescriptionFromApi) => ({
          onClick: () => handleSelectPrescription(record)
        })}
      />

      {selectedPrescription && (
        <Card title={`Détails Ordonnance ${selectedPrescription.prescription_id}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Descriptions title="Informations" column={1} bordered>
                <Descriptions.Item label="Patient">
                  {selectedPatient ? (
                    <>
                      <div className="font-semibold">{selectedPatient.fullName}</div>
                      <div>{selectedPatient.phone}</div>
                      <div>{selectedPatient.address}</div>
                    </>
                  ) : 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Médecin prescripteur">
                  {selectedDoctor ? (
                    <>
                      <div className="font-semibold">{selectedDoctor.fullname}</div>
                      <div>{selectedDoctor.specialty}</div>
                      <div>{selectedDoctor.phone}</div>
                    </>
                  ) : 'N/A'}
                </Descriptions.Item>
              </Descriptions>

              <Divider orientation="left">Historique des paiements</Divider>
              <div className="space-y-2">
                {(payments as PaymentFromApi[])
                  .filter((p: PaymentFromApi) => (p.consultation_id || p.consultationId) === selectedPrescription.consultation_id)
                  .map((payment: PaymentFromApi) => (
                    <Card key={payment.payment_id || payment.paymentId} size="small">
                      <div className="flex justify-between">
                        <span>{payment.payment_method || payment.paymentMethod}</span>
                        <span className="font-bold">{payment.amount} XAF</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {dayjs(payment.created_at || payment.createdAt).format('DD/MM/YYYY')}
                      </div>
                    </Card>
                  ))}
              </div>
            </div>

            <div>
              <Descriptions title="Médicaments prescrits" column={1} bordered>
                {selectedPrescription.items.map((item: PrescriptionItem, index: number) => (
                  <Descriptions.Item key={index} label={item.name}>
                    <div>Posologie: {item.dosage}</div>
                    <div>Durée: {item.duration}</div>
                    <div>Indication: {item.indication}</div>
                  </Descriptions.Item>
                ))}
              </Descriptions>
            </div>
          </div>
        </Card>
      )}

      <Modal
        title={`Paiement - Ordonnance ${selectedPrescription?.prescription_id || ''}`}
        open={paymentModalVisible}
        onOk={handlePayment}
        onCancel={() => setPaymentModalVisible(false)}
        okText="Confirmer le paiement"
        cancelText="Annuler"
      >
        {selectedPrescription && (
          <div className="space-y-4">
            <Input
              addonBefore="Montant (XAF)"
              value={paymentData.amount}
              onChange={(e) => setPaymentData({
                ...paymentData,
                amount: e.target.value
              })}
            />

            <Select
              style={{ width: '100%' }}
              value={paymentData.method}
              onChange={(value) => setPaymentData({
                ...paymentData,
                method: value as "cash" | "card" | "insurance"
              })}
              options={[
                { value: 'cash', label: 'Espèces' },
                { value: 'card', label: 'Carte Bancaire' },
                { value: 'insurance', label: 'Assurance' },
              ]}
            />

            <Input
              addonBefore="Référence"
              value={paymentData.reference}
              onChange={(e) => setPaymentData({
                ...paymentData,
                reference: e.target.value
              })}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PrescriptionsPage;