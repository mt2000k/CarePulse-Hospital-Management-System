const dotenv = require('dotenv');
dotenv.config();

const { connectDB } = require('../config/db');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Department = require('../models/Department');
const DoctorSchedule = require('../models/DoctorSchedule');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const Prescription = require('../models/Prescription');

const runSeed = async ({ exit = false } = {}) => {
  try {
    console.log('[Seed] Checking Database Connection...');
    if (exit) {
      await connectDB();
    }

    console.log('[Seed] Clearing existing collections...');
    await User.deleteMany({});
    await Patient.deleteMany({});
    await Doctor.deleteMany({});
    await Department.deleteMany({});
    await DoctorSchedule.deleteMany({});
    await Appointment.deleteMany({});
    await MedicalRecord.deleteMany({});
    await Prescription.deleteMany({});

    console.log('[Seed] Creating Admin account...');
    await User.create({
      name: 'System Administrator',
      email: 'admin@hms.com',
      password: 'adminpassword123',
      role: 'admin',
      phone: '+1 (555) 019-2834',
      status: 'active'
    });

    console.log('[Seed] Creating Departments...');
    const departmentsData = [
      {
        name: 'Cardiology',
        description: 'Comprehensive cardiovascular care including diagnostic testing, angioplasty, and cardiac rehabilitation.',
        image: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?auto=format&fit=crop&w=600&q=80',
        status: 'active'
      },
      {
        name: 'Neurology',
        description: 'Advanced diagnosis and treatment for disorders of the brain, spinal cord, nerves, and neuromuscular system.',
        image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=600&q=80',
        status: 'active'
      },
      {
        name: 'Orthopedics',
        description: 'Specialized care for bones, joints, ligaments, tendons, and spine including joint replacements and sports medicine.',
        image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80',
        status: 'active'
      },
      {
        name: 'Pediatrics',
        description: 'Dedicated healthcare services for infants, children, and adolescents delivered in a compassionate environment.',
        image: 'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?auto=format&fit=crop&w=600&q=80',
        status: 'active'
      },
      {
        name: 'Dermatology',
        description: 'Expert skin care for acne, eczema, psoriasis, skin cancer screenings, and cosmetic procedures.',
        image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=600&q=80',
        status: 'active'
      },
      {
        name: 'General Medicine',
        description: 'Primary medical care, preventive health exams, chronic disease management, and urgent consultation.',
        image: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=600&q=80',
        status: 'active'
      }
    ];

    const createdDepartments = await Department.insertMany(departmentsData);
    const deptMap = {};
    createdDepartments.forEach(d => { deptMap[d.name] = d._id; });

    console.log('[Seed] Creating Doctors...');
    const doctorsData = [
      {
        name: 'Dr. Sarah Jenkins',
        email: 'sarah.jenkins@hms.com',
        password: 'doctorpassword123',
        phone: '+1 (555) 234-5678',
        deptName: 'Cardiology',
        qualification: 'MD, FACC, Harvard Medical School',
        specialization: 'Interventional Cardiology',
        experience: 14,
        consultationFee: 150,
        bio: 'Dr. Sarah Jenkins is a renowned Senior Interventional Cardiologist with over 14 years of experience treating coronary artery disease and heart failures.',
        profileImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'Dr. Marcus Vance',
        email: 'marcus.vance@hms.com',
        password: 'doctorpassword123',
        phone: '+1 (555) 345-6789',
        deptName: 'Neurology',
        qualification: 'MD, PhD, Johns Hopkins University',
        specialization: 'Neurophysiology & Epilepsy',
        experience: 11,
        consultationFee: 180,
        bio: 'Dr. Marcus Vance specializes in complex neurological conditions, seizure management, and cognitive disorders with extensive academic research.',
        profileImage: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'Dr. Elena Rostova',
        email: 'elena.rostova@hms.com',
        password: 'doctorpassword123',
        phone: '+1 (555) 456-7890',
        deptName: 'Orthopedics',
        qualification: 'MS (Orthopedics), Stanford Medicine',
        specialization: 'Joint Replacement & Sports Surgery',
        experience: 9,
        consultationFee: 130,
        bio: 'Dr. Elena Rostova has completed over 1,200 successful knee and hip replacements and works closely with professional athletes.',
        profileImage: 'https://images.unsplash.com/photo-1594824813566-88855ce7890b?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'Dr. Robert Chen',
        email: 'robert.chen@hms.com',
        password: 'doctorpassword123',
        phone: '+1 (555) 567-8901',
        deptName: 'Pediatrics',
        qualification: 'MD (Pediatrics), FAAP, Columbia University',
        specialization: 'Pediatric Care & Neonatology',
        experience: 16,
        consultationFee: 100,
        bio: 'Dr. Robert Chen has dedicated 16 years to child wellness, immunization, and pediatric emergency medicine.',
        profileImage: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'Dr. Maya Patel',
        email: 'maya.patel@hms.com',
        password: 'doctorpassword123',
        phone: '+1 (555) 678-9012',
        deptName: 'Dermatology',
        qualification: 'MD, DNB (Dermatology), Yale School of Medicine',
        specialization: 'Clinical Dermatology & Laser Therapy',
        experience: 8,
        consultationFee: 120,
        bio: 'Dr. Maya Patel provides comprehensive dermatological care ranging from medical acne treatment to aesthetic anti-aging protocols.',
        profileImage: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'Dr. David Miller',
        email: 'david.miller@hms.com',
        password: 'doctorpassword123',
        phone: '+1 (555) 789-0123',
        deptName: 'General Medicine',
        qualification: 'MBBS, MD (Internal Medicine), Oxford',
        specialization: 'Internal Medicine & Chronic Disease Management',
        experience: 15,
        consultationFee: 90,
        bio: 'Dr. David Miller provides holistic general medical diagnostics, health counseling, and preventive screenings.',
        profileImage: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80'
      }
    ];

    const createdDoctors = [];

    for (const doc of doctorsData) {
      const u = await User.create({
        name: doc.name,
        email: doc.email.toLowerCase(),
        password: doc.password,
        role: 'doctor',
        phone: doc.phone,
        avatar: doc.profileImage,
        status: 'active'
      });

      const d = await Doctor.create({
        userId: u._id,
        departmentId: deptMap[doc.deptName],
        qualification: doc.qualification,
        specialization: doc.specialization,
        experience: doc.experience,
        consultationFee: doc.consultationFee,
        bio: doc.bio,
        profileImage: doc.profileImage,
        status: 'active'
      });

      createdDoctors.push(d);
    }

    console.log('[Seed] Creating Doctor Schedules...');
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    for (const doc of createdDoctors) {
      for (const day of daysOfWeek) {
        await DoctorSchedule.create({
          doctorId: doc._id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '17:00',
          breakStart: '13:00',
          breakEnd: '14:00',
          slotDuration: 30,
          maxAppointments: 14,
          status: 'active'
        });
      }
    }

    console.log('[Seed] Creating Patients...');
    const patientsData = [
      {
        name: 'John Doe',
        email: 'john.doe@gmail.com',
        password: 'patientpassword123',
        phone: '+1 (555) 111-2233',
        dateOfBirth: '1988-05-14',
        gender: 'Male',
        bloodGroup: 'O+',
        address: '742 Evergreen Terrace, Springfield',
        emergencyContact: 'Mary Doe (+1 555-999-8877)',
        medicalHistory: 'Mild hypertension, penicillin allergy'
      },
      {
        name: 'Emily Davis',
        email: 'emily.davis@gmail.com',
        password: 'patientpassword123',
        phone: '+1 (555) 222-3344',
        dateOfBirth: '1995-11-20',
        gender: 'Female',
        bloodGroup: 'A+',
        address: '123 Maple Street, Boston, MA',
        emergencyContact: 'James Davis (+1 555-888-7766)',
        medicalHistory: 'No chronic illness'
      },
      {
        name: 'Michael Brown',
        email: 'michael.brown@gmail.com',
        password: 'patientpassword123',
        phone: '+1 (555) 333-4455',
        dateOfBirth: '1976-02-08',
        gender: 'Male',
        bloodGroup: 'B+',
        address: '456 Oak Lane, Chicago, IL',
        emergencyContact: 'Laura Brown (+1 555-777-6655)',
        medicalHistory: 'Type 2 Diabetes mellitus'
      }
    ];

    const createdPatients = [];
    for (const p of patientsData) {
      const u = await User.create({
        name: p.name,
        email: p.email.toLowerCase(),
        password: p.password,
        role: 'patient',
        phone: p.phone,
        status: 'active'
      });

      const pat = await Patient.create({
        userId: u._id,
        dateOfBirth: p.dateOfBirth,
        gender: p.gender,
        bloodGroup: p.bloodGroup,
        address: p.address,
        emergencyContact: p.emergencyContact,
        medicalHistory: p.medicalHistory
      });

      createdPatients.push(pat);
    }

    console.log('[Seed] Creating Sample Appointments, Records & Prescriptions...');
    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);
    const pastDateStr = pastDate.toISOString().split('T')[0];

    // Completed Appointment with Medical Record & Prescription
    const apt1 = await Appointment.create({
      appointmentNumber: 'APT-20261003-1001',
      patientId: createdPatients[0]._id,
      doctorId: createdDoctors[0]._id, // Dr. Sarah (Cardiology)
      departmentId: createdDoctors[0].departmentId,
      appointmentDate: pastDateStr,
      appointmentTime: '10:00',
      reason: 'Chest tightness and shortness of breath after exertion',
      appointmentType: 'Consultation',
      status: 'Completed',
      notes: 'Patient responded well to ECG evaluation.'
    });

    const medRec1 = await MedicalRecord.create({
      patientId: createdPatients[0]._id,
      doctorId: createdDoctors[0]._id,
      appointmentId: apt1._id,
      symptoms: 'Mild chest pain during morning exercise, elevated BP 135/85.',
      diagnosis: 'Stage 1 Essential Hypertension, rule out myocardial ischemia.',
      consultationNotes: 'ECG baseline normal rhythm. Recommended low-sodium diet and stress management.',
      followUpInstructions: 'Recheck Blood Pressure in 2 weeks. Return immediately if chest pain worsens.',
      consultationDate: pastDate
    });

    await Prescription.create({
      medicalRecordId: medRec1._id,
      patientId: createdPatients[0]._id,
      doctorId: createdDoctors[0]._id,
      medicines: [
        {
          name: 'Amlodipine Besylate',
          dosage: '5mg',
          frequency: 'Once daily (Morning)',
          duration: '30 days',
          instructions: 'Take with a glass of water after breakfast.'
        },
        {
          name: 'Aspirin',
          dosage: '81mg',
          frequency: 'Once daily',
          duration: '30 days',
          instructions: 'Take after meals.'
        }
      ]
    });

    // Upcoming Confirmed Appointment for Tomorrow
    await Appointment.create({
      appointmentNumber: 'APT-20261009-2002',
      patientId: createdPatients[0]._id,
      doctorId: createdDoctors[1]._id, // Dr. Marcus (Neurology)
      departmentId: createdDoctors[1].departmentId,
      appointmentDate: tomorrowStr,
      appointmentTime: '11:00',
      reason: 'Frequent migraines and light sensitivity',
      appointmentType: 'Consultation',
      status: 'Confirmed'
    });

    // Upcoming Pending Appointment for Today
    await Appointment.create({
      appointmentNumber: 'APT-20261008-3003',
      patientId: createdPatients[1]._id,
      doctorId: createdDoctors[2]._id, // Dr. Elena (Orthopedics)
      departmentId: createdDoctors[2].departmentId,
      appointmentDate: todayStr,
      appointmentTime: '14:30',
      reason: 'Right knee joint pain after jogging',
      appointmentType: 'General Checkup',
      status: 'Pending'
    });

    // Cancelled Appointment
    await Appointment.create({
      appointmentNumber: 'APT-20261005-4004',
      patientId: createdPatients[2]._id,
      doctorId: createdDoctors[5]._id, // Dr. David (General Medicine)
      departmentId: createdDoctors[5].departmentId,
      appointmentDate: pastDateStr,
      appointmentTime: '15:00',
      reason: 'Routine annual physical exam',
      appointmentType: 'General Checkup',
      status: 'Cancelled',
      cancellationReason: 'Patient had travel conflict.'
    });

    console.log('\n=======================================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('=======================================================');
    console.log('🔑 DEMO ACCOUNTS READY FOR LOGIN:');
    console.log('   Admin: admin@hms.com / adminpassword123');
    console.log('   Doctor: sarah.jenkins@hms.com / doctorpassword123');
    console.log('   Patient: john.doe@gmail.com / patientpassword123');
    console.log('=======================================================\n');

    if (exit) {
      process.exit(0);
    }
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    if (exit) process.exit(1);
  }
};

if (require.main === module) {
  runSeed({ exit: true });
}

module.exports = { runSeed };
