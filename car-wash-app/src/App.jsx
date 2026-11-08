import React, { useState, useEffect } from 'react';
import { 
  Car, Shield, Users, Building, Plus, Printer, Camera, Phone, MapPin, Tag, 
  Settings, DollarSign, Mail, AlertTriangle, Trash2, Edit3, Image as ImageIcon, 
  RefreshCw, Bike, Bell, CheckSquare, Award, FileSpreadsheet, UserPlus, Wallet,
  LogOut, CheckCircle, UsersRound, Globe
} from 'lucide-react';
import { auth, db } from './firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail, signOut } from 'firebase/auth';
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, setDoc } from 'firebase/firestore';

export default function App() {
  // 🌟 نظام اللغات البرمجي الشامل للموقع بالكامل (عربي، تركي، إنجليزي)
  const [lang, setLang] = useState('ar');

  const dict = {
    ar: {
      loginTitle: 'نظام إدارة المغاسل السحابي',
      loginSub: 'سجل دخولك عبر النظام السحابي الآمن والفخم',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      forgotPass: 'نسيت كلمة المرور؟',
      loginBtn: 'تسجيل الدخول الآمن 🚀',
      secureNotice: 'حماية مشفرة بالكامل عبر بروتوكول السحابة الآمن',
      logout: 'خروج',
      dash: '📊 نظرة عامة والجرد',
      addShopTab: '➕ إضافة فرع جديد لفروعي',
      accountingTab: '📑 كشف الحسابات والديون والأرباح',
      profileTab: '⚙️ الملف الشخصي والضريبي',
      activeShopNow: 'الفرع النشط حالياً',
      netProfitTotal: 'صافي الأرباح الكلي',
      cashBox: 'صندوق الكاش 💵',
      bankBox: 'حساب البنك / الشبكة 💳',
      debtsTotal: 'إجمالي الديون المعلقة ⚠️',
      expensesTotal: 'إجمالي المصاريف 📉',
      carsWashed: 'المركبات المغسولة 🚗',
      newWashTitle: 'تسجيل غسيل جديد',
      editVehicleTitle: 'تعديل معلومات المركبة ✏️',
      vehicleType: 'نوع المركبة *',
      car: 'سيارة',
      motor: 'موتور / دراجة',
      selectCarModel: 'اختر أو ابحث عن موديل السيارة *',
      plateNumber: 'رقم اللوحة *',
      serviceType: 'نوع الخدمة',
      startTime: 'وقت البدء',
      endTime: 'وقت الانتهاء',
      priceLabel: 'السعر (تحديد يدوي) *',
      notesLabel: 'ملاحظات (اختياري)',
      docPhotos: 'توثيق حالة المركبة بالصور',
      beforePhoto: 'صورة قبل الغسيل',
      afterPhoto: 'صورة بعد الغسيل',
      openCam: 'فتح الكاميرا',
      fromGallery: 'من الاستوديو',
      payMethod: 'طريقة الدفع',
      cash: 'كاش 💵',
      bank: 'بنك 💳',
      debt: 'دين ⚠️',
      saveOrder: 'حفظ الطلب والتحديث 🚀',
      cancel: 'إلغاء',
      pendingDebtsList: '⚠️ قائمة الديون المعلقة (تسديد ديون الزبائن)',
      todayVehicles: 'المركبات المسجلة اليوم في',
      printInvoice: 'طباعة الفاتورة',
      edit: 'تعديل',
      delete: 'حذف',
      addExpenseTitle: 'تسجيل مصروف لـ',
      expenseTitlePlaceholder: 'عنوان المصروف',
      amountPlaceholder: 'المبلغ',
      saveExpenseBtn: 'خصم وتسجيل المصروف 📉',
      totalServices: 'إجمالي الخدمات',
      totalPaid: 'المقبوض النقدي والبنكي',
      debtsAmount: 'الديون المعلقة',
      totalExpAmount: 'إجمالي المصاريف',
      netProfitsAmount: 'صافي الأرباح',
      printPdf: 'طباعة كشف الحساب المالي (PDF)',
      profileSettings: 'الملف الشخصي والبيانات الضريبية ⚙️',
      ownerNameLabel: 'اسم صاحب المحل / المؤسسة',
      taxLabel: 'الرقم الضريبي / المعرف الضريبي',
      saveProfileBtn: 'حفظ التعديلات الضريبية والشخصية',
      addShopTitle: 'إضافة فرع جديد لمجموعتك',
      addShopSub: 'سيحصل الفرع الجديد على فترة تجريبية مجانية 7 أيام تلقائياً',
      branchNamePlaceholder: 'اسم الفرع الجديد (مثال: مغسلة النسر - الفرع الجديد) *',
      workerEmailPlaceholder: 'إيميل العامل لهذا الفرع (Gmail) *',
      workerPassPlaceholder: 'كلمة سر العامل *',
      branchPhonePlaceholder: 'رقم هاتف الفرع',
      branchAddressPlaceholder: 'عنوان الفرع (المنطقة والشارع)',
      addShopBtn: 'إضافة الفرع الجديد لفروعي 🚀',
      myShops: 'فروعي المسجلة حالياً',
      activeStatus: 'نشط',
      suspendedStatus: 'معلق / مؤرشف',
      updateList: 'تحديث القائمة',
      refreshData: 'تحديث البيانات'
    },
    tr: {
      loginTitle: 'Bulut Oto Yıkama Yönetim Sistemi',
      loginSub: 'Güvenli bulut sistemi üzerinden giriş yapın',
      email: 'E-posta Adresi',
      password: 'Şifre',
      forgotPass: 'Şifremi Unuttum?',
      loginBtn: 'Güvenli Giriş 🚀',
      secureNotice: 'Güvenli bulut protokolü ile tamamen şifrelenmiştir',
      logout: 'Çıkış',
      dash: '📊 Genel Bakış ve Envanter',
      addShopTab: '➕ Yeni Şube Ekle',
      accountingTab: '📑 Hesap Özeti, Borçlar ve Kâr',
      profileTab: '⚙️ Profil ve Vergi Bilgileri',
      activeShopNow: 'Aktif Şube',
      netProfitTotal: 'Toplam Net Kâr',
      cashBox: 'Nakit Kasa 💵',
      bankBox: 'Banka / Kart 💳',
      totalDebts: 'Bekleyen Borçlar ⚠️',
      totalExpenses: 'Toplam Giderler 📉',
      carsWashed: 'Yıkanan Araçlar 🚗',
      newWashTitle: 'Yeni Yıkama Kaydı',
      editVehicleTitle: 'Araç Bilgilerini Düzenle ✏️',
      vehicleType: 'Araç Türü *',
      car: 'Otomobil',
      motor: 'Motosiklet',
      selectCarModel: 'Araç modelini seçin veya arayın *',
      plateNumber: 'Plaka Numarası *',
      serviceType: 'Hizmet Türü',
      startTime: 'Başlangıç Saati',
      endTime: 'Bitiş Saati',
      priceLabel: 'Fiyat (Manuel) *',
      notesLabel: 'Notlar (İsteğe bağlı)',
      docPhotos: 'Araç Durumunu Fotoğrafla Belgele',
      beforePhoto: 'Yıkanmadan Önce',
      afterPhoto: 'Yıkantıktan Sonra',
      openCam: 'Kamera',
      fromGallery: 'Galeriden',
      payMethod: 'Ödeme Yöntemi',
      cash: 'Nakit 💵',
      bank: 'Banka 💳',
      debt: 'Veresiye ⚠️',
      saveOrder: 'Siparişi Kaydet 🚀',
      cancel: 'İptal',
      pendingDebtsList: '⚠️ Bekleyen Borçlar Listesi',
      todayVehicles: 'Bugün Kaydedilen Araçlar:',
      printInvoice: 'Fatura Yazdır',
      edit: 'Düzenle',
      delete: 'Sil',
      addExpenseTitle: 'Gider Ekle:',
      expenseTitlePlaceholder: 'Gider Başlığı',
      amountPlaceholder: 'Tutar',
      saveExpenseBtn: 'Gideri Kaydet ve Düş 📉',
      totalServices: 'Toplam Hizmetler',
      totalPaid: 'Tahsilat (Nakit/Banka)',
      debtsAmount: 'Bekleyen Borçlar',
      totalExpAmount: 'Toplam Giderler',
      netProfitsAmount: 'Net Kâr',
      printPdf: 'Hesap Özetini Yazdır (PDF)',
      profileSettings: 'Profil ve Vergi Bilgileri ⚙️',
      ownerNameLabel: 'İşletme Sahibi Adı',
      taxLabel: 'Vergi Numarası',
      branchesCount: 'Toplam Şubeler',
      activeBranches: 'Aktif Şubeler',
      totalRevenue: 'Toplam Gelir',
      addShopTitle: 'Grubunuza Yeni Şube Ekleyin',
      addShopSub: 'Yeni şube otomatik olarak 7 gün ücretsiz deneme süresi alacaktır',
      branchNamePlaceholder: 'Yeni Şube Adı *',
      workerEmailPlaceholder: 'Çalışan E-posta (Gmail) *',
      workerPassPlaceholder: 'Çalışan Şifresi *',
      branchPhonePlaceholder: 'Şube Telefonu',
      branchAddressPlaceholder: 'Şube Adresi',
      addShopBtn: 'Yeni Şubeyi Ekle 🚀',
      myShops: 'Kayıtlı Şubelerim:',
      activeStatus: 'Aktif',
      suspendedStatus: 'Askıda / Süresi Dolmuş',
      updateList: 'Listeyi Güncelle',
      refreshData: 'Verileri Güncelle'
    },
    en: {
      loginTitle: 'Cloud Car Wash Management',
      loginSub: 'Sign in through the secure cloud system',
      email: 'Email Address',
      password: 'Password',
      forgotPass: 'Forgot Password?',
      loginBtn: 'Secure Login 🚀',
      secureNotice: 'Fully encrypted via secure cloud protocol',
      logout: 'Logout',
      dash: '📊 Overview & Inventory',
      addShopNav: '➕ Add New Branch',
      accountingTab: '📑 Accounts, Debts & Profits',
      profileTab: '⚙️ Profile & Tax Info',
      activeShopNow: 'Active Branch',
      netProfitTotal: 'Total Net Profit',
      cashBox: 'Cash Box 💵',
      bankBox: 'Bank / Card 💳',
      totalDebts: 'Pending Debts ⚠️',
      totalExpenses: 'Total Expenses 📉',
      carsWashed: 'Washed Cars 🚗',
      newWashTitle: 'New Wash Record',
      editVehicleTitle: 'Edit Vehicle Info ✏️',
      vehicleType: 'Vehicle Type *',
      car: 'Car',
      motor: 'Motorcycle',
      selectCarModel: 'Select or search car model *',
      plateNumber: 'Plate Number *',
      serviceType: 'Service Type',
      startTime: 'Start Time',
      endTime: 'End Time',
      priceManual: 'Price (Manual) *',
      notes: 'Notes (Optional)',
      docPhotos: 'Document Vehicle Condition with Photos',
      beforePhoto: 'Before Wash',
      afterPhoto: 'After Wash',
      openCam: 'Camera',
      fromGallery: 'Gallery',
      payMethod: 'Payment Method',
      cash: 'Cash 💵',
      bank: 'Bank 💳',
      debt: 'Debt ⚠️',
      saveOrder: 'Save Order 🚀',
      cancel: 'Cancel',
      pendingDebtsList: '⚠️ Pending Debts List',
      todayVehicles: 'Registered Vehicles Today in',
      printInvoice: 'Print Invoice',
      edit: 'Edit',
      delete: 'Delete',
      addExpenseTitle: 'Add Expense for',
      expenseTitlePlaceholder: 'Expense Title',
      amountPlaceholder: 'Amount',
      saveExpenseBtn: 'Save & Deduct Expense 📉',
      totalServices: 'Total Services',
      totalPaid: 'Collected Amount',
      debtsAmount: 'Pending Debts',
      totalExpAmount: 'Total Expenses',
      netProfitsAmount: 'Net Profit',
      printPdf: 'Print Financial Statement (PDF)',
      profileSettings: 'Profile & Tax Information ⚙️',
      ownerNameLabel: 'Owner / Business Name',
      taxLabel: 'Tax Number',
      branchesCount: 'Total Branches',
      activeBranches: 'Active Branches',
      totalRevenue: 'Total Revenue',
      addShopTitle: 'Add New Branch to Your Group',
      addShopSub: 'The new branch will automatically get a 7-day free trial',
      branchNamePlaceholder: 'New Branch Name *',
      workerEmailPlaceholder: 'Worker Email (Gmail) *',
      workerPassPlaceholder: 'Worker Password *',
      branchPhonePlaceholder: 'Branch Phone',
      branchAddressPlaceholder: 'Branch Address',
      addShopBtn: 'Add Branch to My Group 🚀',
      myShops: 'My Registered Branches:',
      activeStatus: 'Active',
      suspendedStatus: 'Suspended / Expired',
      updateList: 'Update List',
      refreshData: 'Refresh Data'
    }
  };

  const t = dict[lang];

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('carWash_currentUser');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('carWash_currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('carWash_currentUser');
    }
  }, [currentUser]);

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('carWash_currentUser');
  };

  const [inputEmail, setInputEmail] = useState('');
  const [inputPassword, setInputPassword] = useState('');

  const [shops, setShops] = useState([
    { 
      id: 1, 
      name: 'مغسلة النسر - الفرع الرئيسي', 
      owner: 'أحمد محمد', 
      ownerEmail: 'ahmed@gmail.com',
      taxNumber: '1234567890',
      workerEmail: 'worker1@gmail.com',
      workerPass: '123456',
      phone: '+90 531 234 5678', 
      address: 'إسكندرون، شارع أتاتورك', 
      code: 'NESR-1', 
      status: 'active',
      subscriptionType: 'monthly',
      subscriptionExpiry: '2026-11-01',
      discountPercent: 0,
      suspendedAt: null
    }
  ]);

  const [pricingPlans, setPricingPlans] = useState([
    { id: 1, name: 'الباقة الشهرية (محل واحد)', type: 'monthly', price: 500, currency: 'ليرة', maxShops: 1 },
    { id: 2, name: 'الباقة السنوية (حتى 5 فروع)', type: 'yearly', price: 5000, currency: 'ليرة', maxShops: 5 },
    { id: 3, name: 'اشتراك مدى الحياة', type: 'lifetime', price: 15000, currency: 'ليرة', maxShops: 10 }
  ]);

  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanType, setNewPlanType] = useState('');
  const [newPlanPrice, setNewPlanPrice] = useState('');
  const [newPlanMaxShops, setNewPlanMaxShops] = useState('');

  const [editingPlanId, setEditingPlanId] = useState(null);
  const [editPlanName, setEditPlanName] = useState('');
  const [editPlanPrice, setEditPlanPrice] = useState('');
  const [editPlanMaxShops, setEditPlanMaxShops] = useState('');

  const [targetClientEmailForDiscount, setTargetClientEmailForDiscount] = useState('');
  const [directDiscountValue, setDirectDiscountValue] = useState('');

  const [selectedDateFilter, setSelectedDateFilter] = useState(new Date().toISOString().slice(0, 10));
  const [plateSearchQuery, setPlateSearchQuery] = useState('');

  const [toast, setToast] = useState(null);
  
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    message: '',
    onConfirm: null
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 10000);
  };

  const validateTurkishPhone = (phone) => {
    if (!phone) return true;
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length <= 11 && cleanPhone.length >= 10;
  };

  useEffect(() => {
    const unsubShops = onSnapshot(collection(db, "platformShops"), (snapshot) => {
      if (!snapshot.empty) {
        const fetchedShops = snapshot.docs.map(doc => ({ id: Number(doc.id), ...doc.data() }));
        setShops(fetchedShops);

        if (currentUser && currentUser.role === 'owner') {
          const updatedOwnedShops = fetchedShops.filter(s => s.ownerEmail && s.ownerEmail.toLowerCase() === currentUser.email.toLowerCase());
          setCurrentUser(prev => ({
            ...prev,
            ownedShops: updatedOwnedShops
          }));
        }
      } else {
        shops.forEach(async (s) => {
          await setDoc(doc(db, "platformShops", String(s.id)), s);
        });
      }
    });
    return () => unsubShops();
  }, []);

  const comprehensiveCarLibrary = [
    "فيات إيجيا (Fiat Egea)", "فيات لينيا (Fiat Linea)", "فيات پونتو (Fiat Punto)", "فيات دوبلو (Fiat Doblo)", "فيات فيورينو (Fiat Fiorino)", "فيات تيبو (Fiat Tipo)",
    "رينو ميجان (Renault Megane)", "رينو كليو (Renault Clio)", "رينو فلوينس (Renault Fluence)", "رينو سيمبول (Renault Symbol)", "رينو تاليسمان (Renault Talisman)", "رينو كابتشر (Renault Captur)",
    "فورد فوكس (Ford Focus)", "فورد فيستا (Ford Fiesta)", "فورد مونديو (Ford Mondeo)", "فورد كوجا (Ford Kuga)", "فورد ترانزيت (Ford Transit)", "فورد رينجر (Ford Ranger)",
    "تويوتا كورولا (Toyota Corolla)", "تويوتا يارس (Toyota Yaris)", "تويوتا كامري (Toyota Camry)", "تويوتا راف 4 (Toyota RAV4)", "تويوتا هيلوكس (Toyota Hilux)",
    "فولكس فاجن باسات (VW Passat)", "فولكس فاجن جولف (VW Golf)", "فولكس فاجن بولو (VW Polo)", "فولكس فاجن تيغوان (VW Tiguan)", "فولكس فاجن جِتا (VW Jetta)",
    "هيونداي أكسنت (Hyundai Accent)", "هيونداي إلنترا (Hyundai Elantra)", "هيونداي توسان (Hyundai Tucson)", "هيونداي آي 20 (Hyundai i20)", "هيونداي سانتافي (Hyundai Santa Fe)",
    "كيا سبورتاج (Kia Sportage)", "كيا سيراتو (Kia Cerato)", "كيا ريو (Kia Rio)", "كيا سورينتو (Kia Sorento)", "كيا بيكانتو (Kia Picanto)",
    "هوندا سيبيك (Honda Civic)", "هوندا أكورد (Honda Accord)", "هوندا سي آر في (Honda CR-V)",
    "بي إم دبليو الفئة الثالثة (BMW 3 Series)", "بي إم دبليو الفئة الخامسة (BMW 5 Series)", "بي إم دبليو إكس 3 (BMW X3)",
    "مرسيدس الفئة C (Mercedes C-Class)", "مرسيدس الفئة E (Mercedes E-Class)", "مرسيدس جي إل سي (Mercedes GLC)",
    "سكودا أوكتافيا (Skoda Octavia)", "سكودا سوبيرب (Skoda Superb)", "سكودا كودياك (Skoda Kodiaq)",
    "داسيا دستر (Dacia Duster)", "داسيا سانديرو (Sandero)",
    "بيجو 3008 (Peugeot 3008)", "بيجو 208 (Peugeot 208)",
    "أوبل أسترا (Opel Astra)", "أوبل كورسا (Opel Corsa)",
    "نيسان قشقاي (Nissan Qashqai)", "نيسان صني (Nissan Sunny)",
    "توج تي 10 إكس (Togg T10X)"
  ];

  const [transactions, setTransactions] = useState({});
  const [expenses, setExpenses] = useState({});
  const [debts, setDebts] = useState({});
  const [debtRepayments, setDebtRepayments] = useState({});
  const [announcements, setAnnouncements] = useState({});

  useEffect(() => {
    const unsubscribes = [];

    shops.forEach(shop => {
      const shopIdStr = String(shop.id);
      
      const txRef = collection(db, "shops", shopIdStr, "transactions");
      unsubscribes.push(onSnapshot(txRef, (snapshot) => {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTransactions(prev => ({ ...prev, [shop.id]: list }));
      }));

      const expRef = collection(db, "shops", shopIdStr, "expenses");
      unsubscribes.push(onSnapshot(expRef, (snapshot) => {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setExpenses(prev => ({ ...prev, [shop.id]: list }));
      }));

      const debtRef = collection(db, "shops", shopIdStr, "debts");
      unsubscribes.push(onSnapshot(debtRef, (snapshot) => {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDebts(prev => ({ ...prev, [shop.id]: list }));
      }));

      const repRef = collection(db, "shops", shopIdStr, "debtRepayments");
      unsubscribes.push(onSnapshot(repRef, (snapshot) => {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDebtRepayments(prev => ({ ...prev, [shop.id]: list }));
      }));

      const annRef = collection(db, "shops", shopIdStr, "announcements");
      unsubscribes.push(onSnapshot(annRef, (snapshot) => {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAnnouncements(prev => ({ ...prev, [shop.id]: list }));
      }));
    });

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [shops]);

  const [selectedShopId, setSelectedShopId] = useState(1);
  const [activeTab, setActiveTab] = useState('dashboard');

  const [programmerTab, setProgrammerTab] = useState('clients'); 
  const [selectedClientEmail, setSelectedClientEmail] = useState(null);

  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientTax, setNewClientTax] = useState('');
  const [newClientShopName, setNewClientShopName] = useState('');
  const [newClientWorkerEmail, setNewClientWorkerEmail] = useState('');
  const [newClientWorkerPass, setNewClientWorkerPass] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('');

  const [editingClientData, setEditingClientData] = useState(null);

  const [newShopName, setNewShopName] = useState('');
  const [newWorkerEmail, setNewWorkerEmail] = useState('');
  const [newWorkerPass, setNewWorkerPass] = useState('');
  const [newShopPhone, setNewShopPhone] = useState('');
  const [newShopAddress, setNewShopAddress] = useState('');
  const [ownerTaxNumber, setOwnerTaxNumber] = useState('');
  const [editingShopId, setEditingShopId] = useState(null);

  const [ownerNoticeTitle, setOwnerNoticeTitle] = useState('');
  const [ownerNoticeText, setOwnerNoticeText] = useState('');
  const [announcementDate, setAnnouncementDate] = useState(new Date().toISOString().slice(0, 10));

  const [vehicleCategory, setVehicleCategory] = useState('سيارة');
  const [carModel, setCarModel] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [serviceType, setServiceType] = useState('غسيل خارجي وداخلي');
  const [price, setPrice] = useState('');
  const [payMethod, setPayMethod] = useState('كاش');
  const [debtorName, setDebtorName] = useState('');
  const [debtorPhone, setDebtorPhone] = useState('');
  const [txNotes, setTxNotes] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('10:45');
  const [beforePhoto, setBeforePhoto] = useState(null);
  const [afterPhoto, setAfterPhoto] = useState(null);
  const [editingTxId, setEditingTxId] = useState(null);

  const [settlingDebtId, setSettlingDebtId] = useState(null);
  const [repayMethod, setRepayMethod] = useState('كاش');
  const [repayNotes, setRepayNotes] = useState('');
  const [repayDate, setRepayDate] = useState(new Date().toISOString().slice(0, 10));

  const [expCategory, setExpCategory] = useState('غذاء وضيافة');
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expNotes, setExpNotes] = useState('');

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('تم تحديث القوائم وجلب أحدث البيانات بنجاح! 🔄✨', 'success');
    }, 600);
  };

  const handleFirebaseLogin = async (e) => {
    e.preventDefault();
    if (!inputEmail || !inputPassword) return showToast('الرجاء إدخال البريد الإلكتروني وكلمة المرور', 'error');

    try {
      if (inputEmail.toLowerCase() === "munir@gmail.com") {
        setCurrentUser({ email: inputEmail, role: 'programmer', name: 'المبرمج (المدير العام)' });
        return;
      }

      const ownedShops = shops.filter(s => s.ownerEmail && s.ownerEmail.toLowerCase() === inputEmail.toLowerCase());
      if (ownedShops.length > 0) {
        const activeOrValidShops = ownedShops.filter(s => s.status !== 'suspended');
        if (activeOrValidShops.length === 0) {
          showToast('عذراً، حسابك موقوف أو انتهت صلاحية اشتراكه. يرجى مراجعة الإدارة!', 'error');
          return;
        }

        const userData = {
          email: inputEmail,
          role: 'owner',
          ownerName: ownedShops[0].owner,
          taxNumber: ownedShops[0].taxNumber || 'غير مسجل',
          ownedShops: ownedShops
        };
        setCurrentUser(userData);
        const activeFirst = activeOrValidShops[0] || ownedShops[0];
        setSelectedShopId(activeFirst.id);
        return;
      }

      const targetShop = shops.find(s => s.workerEmail && s.workerEmail.toLowerCase() === inputEmail.toLowerCase() && s.workerPass === inputPassword);
      if (targetShop) {
        if (targetShop.status === 'suspended') {
          showToast('عذراً، هذا الفرع معلق أو انتهى اشتراكه من قبل الإدارة!', 'error');
          return;
        }
        const workerData = {
          email: inputEmail,
          role: 'worker',
          shopId: targetShop.id,
          shopName: targetShop.name,
          shopInfo: targetShop
        };
        setCurrentUser(workerData);
        return;
      }

      showToast('البريد الإلكتروني أو كلمة المرور غير صحيحة!', 'error');
    } catch (error) {
      console.error(error);
      showToast('فشل تسجيل الدخول: تأكد من صحة البيانات المدخلة.', 'error');
    }
  };

  const handleForgotPassword = async () => {
    if (!inputEmail) {
      showToast('الرجاء كتابة بريدك الإلكتروني في حقل الإيميل أولاً!', 'error');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, inputEmail);
      showToast('تم إرسال رابط تغيير كلمة المرور إلى بريدك الإلكتروني بنجاح. 📧', 'success');
    } catch (error) {
      console.error(error);
      showToast('حدث خطأ، تأكد من أن البريد الإلكتروني مسجل بشكل صحيح في النظام.', 'error');
    }
  };

  const handleProgrammerAddClient = async (e) => {
    e.preventDefault();
    if (!newClientName || !newClientEmail || !newClientShopName || !newClientWorkerEmail || !newClientWorkerPass) {
      showToast('يرجى تعبئة الحقول الأساسية للعميل وفرعه الأول!', 'error');
      return;
    }

    if (newClientPhone && !validateTurkishPhone(newClientPhone)) {
      showToast('رقم الهاتف المدخل غير صحيح! يرجى ألا يتجاوز 11 رقماً.', 'error');
      return;
    }

    try {
      const shopId = Date.now();
      const trialExpiry = new Date();
      trialExpiry.setDate(trialExpiry.getDate() + 7);

      const newClientShopObj = {
        id: shopId,
        name: newClientShopName,
        owner: newClientName,
        ownerEmail: newClientEmail,
        taxNumber: newClientTax || 'غير مسجل',
        workerEmail: newClientWorkerEmail,
        workerPass: newClientWorkerPass,
        phone: newClientPhone || '+90 ...',
        address: newClientAddress || 'العنوان لم يحدد',
        code: 'SHOP-' + Math.floor(100 + Math.random() * 900),
        status: 'active',
        subscriptionType: 'trial',
        subscriptionExpiry: trialExpiry.toISOString().slice(0, 10),
        discountPercent: 0,
        suspendedAt: null
      };

      await setDoc(doc(db, "platformShops", String(shopId)), newClientShopObj);

      setNewClientName('');
      setNewClientEmail('');
      setNewClientPhone('');
      setNewClientTax('');
      setNewClientShopName('');
      setNewClientWorkerEmail('');
      setNewClientWorkerPass('');
      setNewClientAddress('');

      showToast('تم إضافة العميل الجديد بنجاح، ومَنحه فترة تجريبية مجانية لمدة 7 أيام! 🌟⏳', 'success');
      setProgrammerTab('clients');
    } catch (error) {
      showToast('حدث خطأ أثناء إضافة العميل: ' + error.message, 'error');
    }
  };

  const handleApplyDirectDiscountToClient = async (e) => {
    e.preventDefault();
    if (!targetClientEmailForDiscount || directDiscountValue === '') {
      showToast('اختر العميل وأدخل نسبة الخصم', 'error');
      return;
    }

    try {
      const clientShops = shops.filter(s => s.ownerEmail.toLowerCase() === targetClientEmailForDiscount.toLowerCase());
      for (const shop of clientShops) {
        await updateDoc(doc(db, "platformShops", String(shop.id)), {
          discountPercent: Number(directDiscountValue)
        });
      }
      showToast(`تم تطبيق خصم بنسبة (${directDiscountValue}%) على جميع فروع العميل بنجاح! 🏷️✨`, 'success');
      setDirectDiscountValue('');
      setTargetClientEmailForDiscount('');
    } catch (e) {
      showToast('حدث خطأ أثناء تطبيق الخصم.', 'error');
    }
  };

  const handleSaveClientEdits = async (e) => {
    e.preventDefault();
    if (!editingClientData) return;

    if (editingClientData.phone && !validateTurkishPhone(editingClientData.phone)) {
      showToast('رقم الهاتف غير صالح! الحد الأقصى 11 رقماً.', 'error');
      return;
    }

    try {
      const clientShops = shops.filter(s => s.ownerEmail.toLowerCase() === editingClientData.ownerEmail.toLowerCase());
      for (const shop of clientShops) {
        await updateDoc(doc(db, "platformShops", String(shop.id)), {
          owner: editingClientData.ownerName,
          taxNumber: editingClientData.taxNumber,
          phone: editingClientData.phone
        });
      }
      setEditingClientData(null);
      showToast('تم تحديث بيانات العميل والبيانات الضريبية بنجاح! ✅', 'success');
    } catch (e) {
      showToast('حدث خطأ أثناء التحديث.', 'error');
    }
  };

  const handleSuspendClientForMonths = (clientEmail) => {
    setConfirmModal({
      isOpen: true,
      message: 'هل أنت متأكد من تعليق حساب هذا العميل وجميع فروعه (أرشفة لمدة 3 أشهر)؟',
      onConfirm: async () => {
        try {
          const threeMonthsLater = new Date();
          threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

          const clientShops = shops.filter(s => s.ownerEmail.toLowerCase() === clientEmail.toLowerCase());
          for (const shop of clientShops) {
            await updateDoc(doc(db, "platformShops", String(shop.id)), {
              status: 'suspended',
              suspendedAt: new Date().toISOString(),
              gracePeriodExpiry: threeMonthsLater.toISOString().slice(0, 10)
            });
          }
          setSelectedClientEmail(null);
          showToast('تم تعليق الحساب وأرشفته بنجاح لمدة 3 أشهر.', 'success');
        } catch (e) {
          showToast('حدث خطأ أثناء تعليق الحساب.', 'error');
        }
        setConfirmModal({ isOpen: false, message: '', onConfirm: null });
      }
    });
  };

  const handleUpdateClientSubscription = async (clientEmail, planType) => {
    let expiryDate = '';
    const now = new Date();

    if (planType === 'monthly') {
      now.setDate(now.getDate() + 30);
      expiryDate = now.toISOString().slice(0, 10);
    } else if (planType === 'yearly') {
      now.setFullYear(now.getFullYear() + 1);
      expiryDate = now.toISOString().slice(0, 10);
    } else if (planType === 'lifetime') {
      expiryDate = 'مدى الحياة ♾️';
    } else {
      now.setDate(now.getDate() + 30);
      expiryDate = now.toISOString().slice(0, 10);
    }

    try {
      const clientShops = shops.filter(s => s.ownerEmail.toLowerCase() === clientEmail.toLowerCase());
      for (const shop of clientShops) {
        await updateDoc(doc(db, "platformShops", String(shop.id)), {
          subscriptionType: planType,
          subscriptionExpiry: expiryDate,
          status: 'active',
          suspendedAt: null,
          gracePeriodExpiry: null
        });
      }
      showToast(`تم تجديد اشتراك العميل (${clientEmail}) بنجاح لجميع فروعه (${clientShops.length} فروع)! 🌟✨`, 'success');
    } catch (e) {
      showToast('حدث خطأ أثناء تجديد الاشتراك.', 'error');
    }
  };

  const handleRemoveClientSubscription = (clientEmail) => {
    setConfirmModal({
      isOpen: true,
      message: 'هل أنت متأكد من إلغاء وحذف اشتراك هذا العميل؟ سيتم إيقاف فروعه مؤقتاً.',
      onConfirm: async () => {
        try {
          const clientShops = shops.filter(s => s.ownerEmail.toLowerCase() === clientEmail.toLowerCase());
          for (const shop of clientShops) {
            await updateDoc(doc(db, "platformShops", String(shop.id)), {
              subscriptionType: 'expired',
              subscriptionExpiry: 'منتهي ❌',
              status: 'suspended'
            });
          }
          showToast('تم إلغاء وحذف اشتراك العميل بنجاح.', 'success');
        } catch (e) {
          showToast('حدث خطأ أثناء إلغاء الاشتراك.', 'error');
        }
        setConfirmModal({ isOpen: false, message: '', onConfirm: null });
      }
    });
  };

  const handleSuspendShop = (shopId) => {
    setConfirmModal({
      isOpen: true,
      message: 'هل أنت متأكد من تعليق هذا الفرع وإيقاف اشتراكه؟',
      onConfirm: async () => {
        try {
          await updateDoc(doc(db, "platformShops", String(shopId)), {
            status: 'suspended',
            suspendedAt: new Date().toISOString()
          });
          showToast('تم تعليق المحل وإيقاف اشتراكه بنجاح.', 'success');
        } catch (e) {
          showToast('حدث خطأ أثناء تعليق الفرع.', 'error');
        }
        setConfirmModal({ isOpen: false, message: '', onConfirm: null });
      }
    });
  };

  const handleActivateShop = async (shopId) => {
    try {
      await updateDoc(doc(db, "platformShops", String(shopId)), {
        status: 'active',
        suspendedAt: null,
        gracePeriodExpiry: null
      });
      showToast('تم تفعيل الفرع بنجاح!', 'success');
    } catch (e) {
      showToast('حدث خطأ أثناء تفعيل الفرع.', 'error');
    }
  };

  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    if (!ownerNoticeTitle || !ownerNoticeText || selectedShopId === 'all') return showToast('الرجاء اختيار فرع محدد وتعبئة العنوان ونَص الملاحظة', 'error');
    
    try {
      await addDoc(collection(db, "shops", String(selectedShopId), "announcements"), {
        title: ownerNoticeTitle,
        text: ownerNoticeText,
        date: announcementDate
      });
      setOwnerNoticeTitle('');
      setOwnerNoticeText('');
      showToast('تم نشر التنبيه بنجاح للعامل في الفرع! 📢✨', 'success');
    } catch (error) {
      showToast('حدث خطأ أثناء نشر التنبيه.', 'error');
    }
  };

  const handleDeleteAnnouncement = (shopId, annId) => {
    setConfirmModal({
      isOpen: true,
      message: 'هل أنت متأكد من حذف هذا التنبيه؟',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, "shops", String(shopId), "announcements", String(annId)));
          showToast('تم حذف التنبيه بنجاح.', 'success');
        } catch (error) {}
        setConfirmModal({ isOpen: false, message: '', onConfirm: null });
      }
    });
  };

  const handleSettleDebtAction = async (shopId, debtObj) => {
    try {
      await deleteDoc(doc(db, "shops", String(shopId), "debts", String(debtObj.id)));
      await addDoc(collection(db, "shops", String(shopId), "debtRepayments"), {
        debtorName: debtObj.debtorName,
        amount: debtObj.amount,
        method: repayMethod,
        notes: repayNotes || 'تسديد دين سابق',
        date: repayDate
      });
      setSettlingDebtId(null);
      setRepayNotes('');
      showToast(`تم تسديد دين الزبون (${debtObj.debtorName}) بقيمة ${debtObj.amount} ليرة بنجاح وإضافته للصندوق! 💵✅`, 'success');
    } catch (error) {
      showToast('حدث خطأ أثناء تسديد الدين.', 'error');
    }
  };

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX = 300;

          if (width > height) {
            if (width > MAX) { height = Math.round((height * MAX) / width); width = MAX; }
          } else {
            if (height > MAX) { width = Math.round((width * MAX) / height); height = MAX; }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.5);

          if (type === 'before') setBeforePhoto(compressed);
          if (type === 'after') setAfterPhoto(compressed);
        } catch (err) {
          showToast('خطأ في معالجة الصورة.', 'error');
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handlePrintInvoice = (inv) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return showToast('يرجى السماح بفتح النوافذ المنبثقة.', 'error');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>فاتورة - ${inv.plate}</title>
        <style>
          body { font-family: Tahoma, sans-serif; padding: 20px; text-align: right; }
          .box { max-width: 450px; margin: auto; border: 2px solid #0f172a; padding: 20px; border-radius: 15px; }
          .center { text-align: center; border-bottom: 2px dashed #cbd5e1; padding-bottom: 10px; margin-bottom: 15px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
          .photos { display: flex; justify-content: space-around; margin-top: 15px; border-top: 1px dashed #cbd5e1; padding-top: 10px; text-align: center; }
          .photos img { width: 45%; height: 90px; object-fit: cover; border-radius: 8px; border: 1px solid #cbd5e1; }
          .total { background: #ecfdf5; color: #047857; padding: 10px; text-align: center; font-weight: bold; margin-top: 15px; border-radius: 8px; border: 1px solid #a7f3d0; }
        </style>
      </head>
      <body>
        <div class="box">
          <div class="center">
            <h2>🏪 ${inv.shopName}</h2>
            <p>${inv.shopInfo?.address || 'إسكندرون'} | هاتف: <span dir="ltr">${inv.shopInfo?.phone || '+90...'}</span></p>
          </div>
          <div class="row"><span>المركبة:</span><strong>${inv.vehicleCategory} (${inv.carModel || ''})</strong></div>
          <div class="row"><span>اللوحة:</span><strong>${inv.plate}</strong></div>
          <div class="row"><span>الخدمة:</span><strong>${inv.service}</strong></div>
          <div class="row"><span>وقت العمل:</span><strong>${inv.startTime || '-'} ➔ ${inv.endTime || '-'}</strong></div>
          <div class="row"><span>الدفع:</span><strong>${inv.method}</strong></div>
          ${inv.notes ? `<div class="row"><span>ملاحظات:</span><strong>${inv.notes}</strong></div>` : ''}

          ${(inv.beforePhoto || inv.afterPhoto) ? `
            <div class="photos">
              ${inv.beforePhoto ? `<div><span style="font-size:10px;">قبل الغسيل</span><img src="${inv.beforePhoto}"/></div>` : ''}
              ${inv.afterPhoto ? `<div><span style="font-size:10px;">بعد الغسيل</span><img src="${inv.afterPhoto}"/></div>` : ''}
            </div>
          ` : ''}

          <div class="total">الإجمالي: ${inv.price} ليرة</div>
        </div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleOwnerSaveShop = async (e) => {
    e.preventDefault();
    if (!newShopName || !newWorkerEmail || !newWorkerPass) return showToast('يرجى تعبئة اسم الفرع وإيميل وكلمة سر العامل', 'error');

    if (newShopPhone && !validateTurkishPhone(newShopPhone)) {
      showToast('رقم هاتف الفرع غير صحيح! يجب ألا يتجاوز 11 رقماً.', 'error');
      return;
    }

    const ownedShops = shops.filter(s => s.ownerEmail && s.ownerEmail.toLowerCase() === currentUser.email.toLowerCase());
    
    if (!editingShopId) {
      const firstShop = ownedShops[0];
      const subType = firstShop ? (firstShop.subscriptionType || 'trial') : 'trial';
      
      let maxAllowedShops = 1; 
      if (subType === 'trial') {
        maxAllowedShops = 1; 
      } else {
        const matchedPlan = pricingPlans.find(p => p.type === subType);
        maxAllowedShops = matchedPlan ? matchedPlan.maxShops : 1;
      }

      if (ownedShops.length >= maxAllowedShops) {
        showToast(`عذراً، باقتك الحالية (${subType}) تمنحك حق إنشاء ${maxAllowedShops} فرع كحد أقصى. يرجى ترقية الباقة لدى الإدارة!`, 'error');
        return;
      }
    }

    try {
      const shopId = editingShopId ? editingShopId : Date.now();
      const firstShop = ownedShops[0] || {};
      const trialExpiry = new Date();
      trialExpiry.setDate(trialExpiry.getDate() + 7);

      const existingShop = shops.find(s => s.id === Number(shopId)) || {};

      const baseSubscriptionType = firstShop.subscriptionType || existingShop.subscriptionType || 'trial';
      const baseSubscriptionExpiry = firstShop.subscriptionExpiry || existingShop.subscriptionExpiry || trialExpiry.toISOString().slice(0, 10);

      const shopObj = {
        id: Number(shopId),
        name: newShopName,
        owner: currentUser.ownerName,
        ownerEmail: currentUser.email,
        taxNumber: currentUser.taxNumber || ownerTaxNumber || 'غير مسجل',
        workerEmail: newWorkerEmail,
        workerPass: newWorkerPass,
        phone: newShopPhone || '+90 ...',
        address: newShopAddress || 'العنوان لم يحدد',
        code: existingShop.code || ('SHOP-' + Math.floor(100 + Math.random() * 900)),
        status: existingShop.status || 'active',
        subscriptionType: baseSubscriptionType,
        subscriptionExpiry: baseSubscriptionExpiry,
        discountPercent: existingShop.discountPercent || 0,
        suspendedAt: existingShop.suspendedAt || null
      };

      await setDoc(doc(db, "platformShops", String(shopId)), shopObj);

      const updatedOwnedShops = editingShopId 
        ? ownedShops.map(s => s.id === Number(shopId) ? shopObj : s)
        : [...ownedShops, shopObj];

      setCurrentUser(prev => ({
        ...prev,
        ownedShops: updatedOwnedShops
      }));

      setNewShopName('');
      setNewWorkerEmail('');
      setNewWorkerPass('');
      setNewShopPhone('');
      setNewShopAddress('');
      setEditingShopId(null);
      setSelectedShopId(shopId);
      
      showToast(editingShopId ? 'تم تحديث بيانات الفرع بنجاح! ✏️✨' : 'تم إضافة الفرع الجديد بنجاح وربطه باشتراكك الأساسي! 🏪✨', 'success');
    } catch (error) {
      showToast('حدث خطأ أثناء الحفظ: ' + error.message, 'error');
    }
  };

  const handleStartEditShop = (shop) => {
    setEditingShopId(shop.id);
    setNewShopName(shop.name);
    setNewWorkerEmail(shop.workerEmail || '');
    setNewWorkerPass(shop.workerPass || '');
    setNewShopPhone(shop.phone || '');
    setNewShopAddress(shop.address || '');
  };

  const handleDeleteShopByOwner = (shopId) => {
    setConfirmModal({
      isOpen: true,
      message: 'هل أنت متأكد من حذف هذا الفرع نهائياً من مجموعتك؟',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, "platformShops", String(shopId)));
          const ownerEmail = currentUser.email.toLowerCase();
          const updatedOwnedShops = shops.filter(s => s.ownerEmail && s.ownerEmail.toLowerCase() === ownerEmail && s.id !== Number(shopId));
          setCurrentUser(prev => ({
            ...prev,
            ownedShops: updatedOwnedShops
          }));
          if (selectedShopId === Number(shopId)) {
            setSelectedShopId(updatedOwnedShops[0]?.id || 'all');
          }
          showToast('تم حذف الفرع بنجاح 🗑️', 'success');
        } catch (e) {
          showToast('حدث خطأ أثناء حذف الفرع', 'error');
        }
        setConfirmModal({ isOpen: false, message: '', onConfirm: null });
      }
    });
  };

  const handleDeleteTransactionByOwner = (shopId, txId) => {
    setConfirmModal({
      isOpen: true,
      message: 'هل أنت متأكد من حذف هذه العملية؟',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, "shops", String(shopId), "transactions", String(txId)));
          showToast('تم الحذف بنجاح', 'success');
        } catch (e) {}
        setConfirmModal({ isOpen: false, message: '', onConfirm: null });
      }
    });
  };

  const handleStartEditTransaction = (t) => {
    setEditingTxId(t.id);
    setVehicleCategory(t.vehicleCategory || 'سيارة');
    setCarModel(t.carModel || '');
    setPlateNumber(t.plate);
    setServiceType(t.service);
    setPrice(t.price);
    setPayMethod(t.method);
    setTxNotes(t.notes || '');
    setStartTime(t.startTime);
    setEndTime(t.endTime);
    if (t.beforePhoto) setBeforePhoto(t.beforePhoto);
    if (t.afterPhoto) setAfterPhoto(t.afterPhoto);
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!plateNumber || !price || !currentUser) return showToast('أدخل اللوحة والسعر!', 'error');
    const shopId = currentUser.role === 'worker' ? currentUser.shopId : selectedShopId;
    if (!shopId || shopId === 'all') return showToast('اختر محلاً محدداً', 'error');

    if (debtorPhone && !validateTurkishPhone(debtorPhone)) {
      showToast('رقم هاتف الزبون المدين غير صحيح! الحد الأقصى 11 رقماً.', 'error');
      return;
    }

    try {
      const todayDateStr = new Date().toISOString().slice(0, 10);
      if (editingTxId) {
        await updateDoc(doc(db, "shops", String(shopId), "transactions", String(editingTxId)), {
          vehicleCategory, carModel: vehicleCategory === 'سيارة' ? carModel : 'دراجة نارية', plate: plateNumber, service: serviceType, price: Number(price), paid: payMethod === 'دين' ? 0 : Number(price), method: payMethod, notes: txNotes, startTime, endTime, beforePhoto, afterPhoto
        });
        setEditingTxId(null);
        showToast('تم التحديث بنجاح ✏️', 'success');
      } else {
        await addDoc(collection(db, "shops", String(shopId), "transactions"), {
          vehicleCategory, carModel: vehicleCategory === 'سيارة' ? carModel : 'دراجة نارية', plate: plateNumber, service: serviceType, price: Number(price), paid: payMethod === 'دين' ? 0 : Number(price), method: payMethod, notes: txNotes, startTime, endTime, date: todayDateStr, beforePhoto, afterPhoto
        });
        if (payMethod === 'دين') {
          await addDoc(collection(db, "shops", String(shopId), "debts"), {
            debtorName, phone: debtorPhone, service: serviceType, amount: Number(price), date: todayDateStr, addedBy: 'عامل الفرع'
          });
          setDebtorName(''); setDebtorPhone('');
        }
        showToast('تم تسجيل الطلب بنجاح! 🚗✨', 'success');
      }
      setPlateNumber(''); setCarModel(''); setPrice(''); setTxNotes(''); setBeforePhoto(null); setAfterPhoto(null);
    } catch (e) { showToast('خطأ: ' + e.message, 'error'); }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    const shopId = currentUser.role === 'worker' ? currentUser.shopId : selectedShopId;
    if (!expTitle || !expAmount || !shopId || shopId === 'all') return showToast('أدخل بيانات المصروف وافرز المحل بدقة', 'error');
    
    try {
      const todayDateStr = new Date().toISOString().slice(0, 10);
      await addDoc(collection(db, "shops", String(shopId), "expenses"), {
        category: expCategory, 
        title: expTitle, 
        amount: Number(expAmount), 
        notes: expNotes, 
        date: todayDateStr,
        time: new Date().toLocaleTimeString()
      });
      setExpTitle(''); setExpAmount(''); setExpNotes('');
      showToast('تم تسجيل المصروف بنجاح وخصمه من كشف الحساب والأرباح! 📉✅', 'success');
    } catch (e) { showToast('حدث خطأ أثناء حفظ المصروف', 'error'); }
  };

  const handleAddPricingPlan = (e) => {
    e.preventDefault();
    if (!newPlanName || !newPlanPrice || !newPlanMaxShops) {
      showToast('يرجى تعبئة جميع حقول الباقة الجديدة!', 'error');
      return;
    }
    const planTypeKey = newPlanType ? newPlanType.toLowerCase().replace(/\s+/g, '_') : ('plan_' + Date.now());
    const newPlanObj = {
      id: Date.now(),
      name: newPlanName,
      type: planTypeKey,
      price: Number(newPlanPrice),
      currency: 'ليرة',
      maxShops: Number(newPlanMaxShops)
    };
    setPricingPlans([...pricingPlans, newPlanObj]);
    setNewPlanName('');
    setNewPlanType('');
    setNewPlanPrice('');
    setNewPlanMaxShops('');
    showToast('تم إضافة الباقة الجديدة بنجاح! 🌟', 'success');
  };

  const handleDeletePricingPlan = (planId) => {
    if (pricingPlans.length <= 1) {
      showToast('يجب أن تبقى باقة واحدة على الأقل في النظام!', 'error');
      return;
    }
    setConfirmModal({
      isOpen: true,
      message: 'هل أنت متأكد من حذف هذه الباقة؟',
      onConfirm: () => {
        setPricingPlans(pricingPlans.filter(p => p.id !== planId));
        showToast('تم حذف الباقة بنجاح.', 'success');
        setConfirmModal({ isOpen: false, message: '', onConfirm: null });
      }
    });
  };

  const handleStartEditPlan = (plan) => {
    setEditingPlanId(plan.id);
    setEditPlanName(plan.name);
    setEditPlanPrice(plan.price);
    setEditPlanMaxShops(plan.maxShops);
  };

  const handleSaveEditPlan = (planId) => {
    setPricingPlans(pricingPlans.map(p => p.id === planId ? {
      ...p,
      name: editPlanName,
      price: Number(editPlanPrice),
      maxShops: Number(editPlanMaxShops)
    } : p));
    setEditingPlanId(null);
    showToast('تم تحديث بيانات الباقة بنجاح! ✅', 'success');
  };

  const calculateTimeRemaining = (expiryDateStr) => {
    if (!expiryDateStr || expiryDateStr.includes('مدى الحياة')) return 'مدى الحياة ♾️';
    const diff = new Date(expiryDateStr) - new Date();
    if (diff <= 0) return 'منتهي الصلاحية ⚠️';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days} يوم و ${hours} ساعة متبقية`;
  };

  const renderToastComponent = () => {
    if (!toast) return null;
    return (
      <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-4 min-w-[320px] max-w-lg">
        <div className={`p-2 rounded-xl ${toast.type === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
          {toast.type === 'error' ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
        </div>
        <div className="flex-1 text-sm font-semibold">{toast.message}</div>
        <button 
          onClick={() => setToast(null)} 
          className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer text-sm font-bold"
        >
          ✕
        </button>
      </div>
    );
  };

  const renderConfirmModal = () => {
    if (!confirmModal.isOpen) return null;
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full space-y-6 border border-slate-100 text-right transform transition-all animate-in fade-in zoom-in-95 duration-200" dir="rtl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">تأكيد الإجراء المطلوب</h3>
              <p className="text-xs text-slate-500 mt-0.5">يرجى التأكيد للمتابعة أو إلغاء الطلب</p>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <p className="text-sm font-semibold text-slate-700 leading-relaxed">{confirmModal.message}</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              onClick={confirmModal.onConfirm}
              className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white py-3 rounded-xl font-bold text-sm cursor-pointer shadow-lg shadow-red-500/25 transition transform active:scale-95"
            >
              تأكيد وحذف / تنفيذ ✅
            </button>
            <button 
              onClick={() => setConfirmModal({ isOpen: false, message: '', onConfirm: null })}
              className="px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold text-sm cursor-pointer transition"
            >
              إلغاء ✕
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ================= لوحة صاحب المحل =================
  const ownedShops = currentUser.ownedShops || [];
  const currentShop = ownedShops.find(s => s.id === Number(selectedShopId)) || ownedShops[0];
  const isAllShops = selectedShopId === 'all';
  const targetShopIds = isAllShops ? ownedShops.map(s => s.id) : [Number(selectedShopId)];

  const calculateDaysRemaining = (expiryDateStr) => {
    if (!expiryDateStr || expiryDateStr.includes('مدى الحياة')) return 'مدى الحياة ♾️';
    const diffTime = new Date(expiryDateStr) - new Date();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysLeft = currentShop ? calculateDaysRemaining(currentShop.subscriptionExpiry) : 999;

  let totalRevenueAll = 0;
  let totalExpensesAll = 0;
  let totalCashAll = 0;
  let totalBankAll = 0;
  let totalVehiclesAll = 0;
  let totalDebtsAll = 0;
  let activeShopsCount = ownedShops.filter(s => s.status === 'active').length;
  let allShopsDebtsList = [];

  targetShopIds.forEach(id => {
    const txList = transactions[id] || [];
    const expList = expenses[id] || [];
    const debtList = debts[id] || [];
    const repList = debtRepayments[id] || [];

    const rev = txList.reduce((acc, t) => acc + Number(t.paid), 0) + repList.reduce((acc, r) => acc + Number(r.amount), 0);
    const exp = expList.reduce((acc, e) => acc + Number(e.amount), 0);
    
    totalRevenueAll += rev;
    totalExpensesAll += exp;
    
    const cashFromTx = txList.filter(t => t.method === 'كاش').reduce((acc, t) => acc + Number(t.paid), 0);
    const cashFromRepay = repList.filter(r => r.method === 'كاش').reduce((acc, r) => acc + Number(r.amount), 0);
    totalCashAll += (cashFromTx + cashFromRepay - exp);

    const bankFromTx = txList.filter(t => t.method === 'بنك').reduce((acc, t) => acc + Number(t.paid), 0);
    const bankFromRepay = repList.filter(r => r.method === 'بنك').reduce((acc, r) => acc + Number(r.amount), 0);
    totalBankAll += (bankFromTx + bankFromRepay);

    totalVehiclesAll += txList.length;

    debtList.forEach(d => {
      totalDebtsAll += Number(d.amount);
      allShopsDebtsList.push({ ...d, shopName: shops.find(s => s.id === id)?.name || '' });
    });
  });

  const netProfit = totalRevenueAll - totalExpensesAll;
  const currentShopExpenses = expenses[selectedShopId] || [];
  const currentShopTx = transactions[selectedShopId] || [];
  const currentShopDebts = debts[selectedShopId] || [];
  const shopRepayList = debtRepayments[selectedShopId] || [];
  const shopAnnouncementsList = announcements[selectedShopId] || [];

  const filteredOwnerTx = currentShopTx.filter(t => {
    const matchDate = !selectedDateFilter || t.date === selectedDateFilter;
    const matchPlate = !plateSearchQuery || (t.plate && t.plate.toLowerCase().includes(plateSearchQuery.toLowerCase()));
    return matchDate && matchPlate;
  });

  const shopTotalServices = currentShopTx.reduce((acc, t) => acc + Number(t.price), 0);
  const shopTotalPaid = currentShopTx.reduce((acc, t) => acc + Number(t.paid), 0) + shopRepayList.reduce((acc, r) => acc + Number(r.amount), 0);
  const shopTotalDebtAmount = currentShopDebts.reduce((acc, d) => acc + Number(d.amount), 0);
  const shopTotalExpenses = currentShopExpenses.reduce((acc, e) => acc + Number(e.amount), 0);
  const shopNetProfit = shopTotalPaid - shopTotalExpenses;

  return (
    <div className="min-h-screen bg-slate-100 font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {renderToastComponent()}
      {renderConfirmModal()}

      {!isAllShops && currentShop && daysLeft <= 3 && daysLeft >= 0 && (
        <div className="bg-amber-500 text-slate-900 px-4 py-2.5 text-center font-black text-xs md:text-sm shadow-md flex items-center justify-center gap-2">
          <AlertTriangle size={18} />
          <span>تحذير هام: سينتهي اشتراك هذا الفرع ({currentShop.name}) خلال {daysLeft} أيام! يرجى التواصل مع الإدارة لتجديد الاشتراك.</span>
        </div>
      )}
      {!isAllShops && currentShop && daysLeft < 0 && (
        <div className="bg-red-600 text-white px-4 py-2.5 text-center font-black text-xs md:text-sm shadow-md flex items-center justify-center gap-2">
          <AlertTriangle size={18} />
          <span>تنبيه: انتهت صلاحية اشتراك هذا الفرع! يرجى التجديد الفوري.</span>
        </div>
      )}

      {/* الهيدر العلوي المحدث مع زر تبديل اللغات */}
      <header className="bg-slate-950 border-b border-slate-800 text-white px-6 py-4 shadow-2xl flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
            <Building size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-extrabold text-white text-base tracking-wide">لوحة تحكم المالك: {currentUser.ownerName}</span>
              <span className="text-[10px] bg-slate-800 text-blue-400 px-2.5 py-0.5 rounded-full font-mono border border-slate-700">الرقم الضريبي: {currentUser.taxNumber}</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">إدارة المحلات والفروع المتعددة، والديون والأرباح</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <Globe size={14} className="text-purple-400 mx-1" />
            <button onClick={() => setLang('ar')} className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${lang === 'ar' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>AR</button>
            <button onClick={() => setLang('tr')} className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${lang === 'tr' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>TR</button>
            <button onClick={() => setLang('en')} className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${lang === 'en' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>EN</button>
          </div>

          <div className="relative">
            <select 
              value={selectedShopId || ''} 
              onChange={e => setSelectedShopId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-xs font-bold border border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer shadow-inner pr-9"
            >
              {ownedShops.map(s => <option key={s.id} value={s.id}>🏪 {s.name} {s.status === 'suspended' ? '(معلق/منتهي)' : ''}</option>)}
              <option value="all">📊 تقرير الجمع الشامل لجميع فروعي ({ownedShops.length} فرع)</option>
            </select>
          </div>
          
          <button 
            onClick={handleLogout} 
            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 hover:border-red-500/50 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 transition shadow-sm"
          >
            <LogOut size={15} /> {t.logout}
          </button>
        </div>
      </header>

      {/* شريط التنقل (Pill Tabs) المحدث */}
      <nav className="bg-white border-b border-slate-200 px-6 py-3 flex gap-3 text-xs md:text-sm font-bold shadow-xs overflow-x-auto">
        <button 
          onClick={() => setActiveTab('dashboard')} 
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap shadow-xs ${activeTab === 'dashboard' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/25' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          {t.dashboard}
        </button>
        <button 
          onClick={() => setActiveTab('addShop')} 
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap shadow-xs ${activeTab === 'addShop' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/25' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          {t.addShopNav}
        </button>
        {!isAllShops && (
          <button 
            onClick={() => setActiveTab('accounting')} 
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap shadow-xs ${activeTab === 'accounting' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/25' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            {t.accounting}
          </button>
        )}
        <button 
          onClick={() => setActiveTab('profile')} 
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap shadow-xs ${activeTab === 'profile' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/25' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          {t.profile}
        </button>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white p-6 rounded-3xl shadow-lg flex flex-wrap justify-between items-center gap-4">
              <div>
                <span className="text-blue-300 text-xs font-bold uppercase tracking-wider">{t.activeShop}</span>
                <h2 className="text-2xl font-black text-white mt-1">{isAllShops ? `تقرير الجمع الشامل لجميع فروعك (${ownedShops.length} فروع)` : currentShop?.name}</h2>
                <p className="text-xs text-gray-300 mt-1">📍 {isAllShops ? `عدد الفروع النشطة: ${activeShopsCount} من أصل ${ownedShops.length} فرع` : currentShop?.address}</p>
                {currentShop?.status === 'suspended' && (
                  <span className="inline-block mt-2 px-3 py-1 bg-red-500 text-white text-xs rounded-full font-bold">هذا الفرع موقوف / انتهى اشتراكه. يرجى التواصل مع الإدارة للتجديد!</span>
                )}
                
                {currentShop && (
                  <div className="mt-3 inline-flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl backdrop-blur-md text-xs font-bold border border-white/15 shadow-inner">
                    <span>⏳ عداد باقتك (الحساب الأساسي):</span>
                    <span className="text-emerald-400 font-mono text-sm">
                      {calculateTimeRemaining(currentShop.subscriptionExpiry)}
                    </span>
                  </div>
                )}
              </div>
              <div className="text-left bg-white/10 p-4 rounded-2xl backdrop-blur-md shadow-inner border border-white/10">
                <span className="text-xs text-blue-200 block font-bold">{t.netProfit}</span>
                <span className="text-3xl font-black text-emerald-400">{netProfit} ليرة</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-100">
                <span className="text-gray-500 text-sm">{t.cashBox}</span>
                <h3 className="text-2xl font-black text-emerald-600 mt-1">{totalCashAll} ليرة</h3>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-blue-100">
                <span className="text-gray-500 text-sm">{t.bankBox}</span>
                <h3 className="text-2xl font-black text-blue-600 mt-1">{totalBankAll} ليرة</h3>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-amber-100">
                <span className="text-gray-500 text-sm">{t.totalDebts}</span>
                <h3 className="text-2xl font-black text-amber-600 mt-1">{totalDebtsAll} ليرة</h3>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-red-100">
                <span className="text-gray-500 text-sm">{t.totalExpenses}</span>
                <h3 className="text-2xl font-black text-red-600 mt-1">{totalExpensesAll} ليرة</h3>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-purple-100">
                <span className="text-gray-500 text-sm">{t.washedCars}</span>
                <h3 className="text-2xl font-black text-purple-600 mt-1">{totalVehiclesAll}</h3>
              </div>
            </div>

            {!isAllShops && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Bell className="text-amber-600" size={18} /> إدارة وتنبيهات عامل {currentShop?.name}
                </h3>
                
                <form onSubmit={handleAddAnnouncement} className="space-y-3 bg-gray-50 p-4 rounded-xl border">
                  <span className="text-xs font-bold text-gray-700 block">إرسال تنبيه جديد للعامل:</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input 
                      type="text" 
                      placeholder="عنوان التنبيه..." 
                      value={ownerNoticeTitle} 
                      onChange={e => setOwnerNoticeTitle(e.target.value)} 
                      onInvalid={e => e.target.setCustomValidity('يرجى إدخال عنوان التنبيه')}
                      onInput={e => e.target.setCustomValidity('')}
                      className="px-3 py-2 border rounded-xl text-sm text-gray-900 bg-white" 
                      required
                    />
                    <input 
                      type="date" 
                      value={announcementDate} 
                      onChange={e => setAnnouncementDate(e.target.value)} 
                      className="px-3 py-2 border rounded-xl text-sm text-gray-900 bg-white" 
                      required
                    />
                  </div>
                  <textarea 
                    placeholder="نص التنبيه والملاحظة الموجهة للعامل..." 
                    value={ownerNoticeText} 
                    onChange={e => setOwnerNoticeText(e.target.value)} 
                    onInvalid={e => e.target.setCustomValidity('يرجى كتابة نص التنبيه')}
                    onInput={e => e.target.setCustomValidity('')}
                    className="w-full px-3 py-2 border rounded-xl text-sm h-16 resize-none text-gray-900 bg-white" 
                    required
                  />
                  <div className="flex justify-end">
                    <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs cursor-pointer shadow-sm">
                      نشر التنبيه 📢
                    </button>
                  </div>
                </form>

                <div className="space-y-2 pt-2">
                  <h4 className="font-bold text-xs text-gray-700">التنبيهات الفعالة المرسلة لهذا الفرع (يمكنك حذفها):</h4>
                  {shopAnnouncementsList.length === 0 ? (
                    <p className="text-xs text-gray-400">لا توجد تنبيهات مرسلة لهذا الفرع حالياً.</p>
                  ) : (
                    <div className="space-y-2">
                      {shopAnnouncementsList.map(ann => (
                        <div key={ann.id} className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex justify-between items-center text-sm">
                          <div>
                            <span className="font-bold text-gray-900">{ann.title}</span>
                            <p className="text-xs text-gray-700 mt-0.5">{ann.text}</p>
                            <span className="text-[10px] text-gray-400 block mt-1">تاريخ النشر: {ann.date}</span>
                          </div>
                          <button 
                            onClick={() => handleDeleteAnnouncement(selectedShopId, ann.id)}
                            className="bg-red-100 text-red-700 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1 hover:bg-red-200 shadow-xs"
                          >
                            <Trash2 size={13} /> حذف
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {isAllShops && (
              <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">📑 كشف الديون المجمع لجميع فروعك</h3>
                  <button 
                    onClick={handleRefreshData} 
                    disabled={isRefreshing}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition border"
                  >
                    <RefreshCw size={14} className={isRefreshing ? "animate-spin text-blue-600" : ""} /> 
                    {isRefreshing ? 'جاري التحديث...' : 'تحديث القوائم'}
                  </button>
                </div>
                {allShopsDebtsList.length === 0 ? (
                  <p className="text-xs text-gray-400">لا توجد ديون مسجلة في أي من فروعك حالياً.</p>
                ) : (
                  <div className="space-y-2">
                    {allShopsDebtsList.map(d => (
                      <div key={d.id} className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex justify-between items-center text-sm">
                        <div>
                          <span className="font-bold text-gray-900">🏪 {d.shopName} | 👤 الزبون: {d.debtorName}</span>
                          <p className="text-xs text-gray-600">📞 الهاتف: <span dir="ltr">{d.phone}</span> | الخدمة: {d.service} (التاريخ: {d.date})</p>
                        </div>
                        <span className="font-black text-red-600 text-base">{d.amount} ليرة</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!isAllShops && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2"><Tag className="text-red-600" size={18} /> {t.addExpenseTitle} {currentShop?.name}</h3>
                  <form onSubmit={handleAddExpense} className="space-y-3">
                    <select value={expCategory} onChange={e => setExpCategory(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm bg-white text-gray-900">
                      <option>غذاء وضيافة</option><option>مواد تنظيف وصيانة</option><option>فواتير خدمات</option><option>مصاريف أخرى</option>
                    </select>
                    <input type="text" placeholder={t.expenseTitlePlaceholder} value={expTitle} onChange={e => setExpTitle(e.target.value)} onInvalid={e => e.target.setCustomValidity('يرجى إدخال عنوان المصروف')} onInput={e => e.target.setCustomValidity('')} className="w-full px-3 py-2 border rounded-xl text-sm text-gray-900" required />
                    <input type="number" placeholder={t.amount} value={expAmount} onChange={e => setExpAmount(e.target.value)} onInvalid={e => e.target.setCustomValidity('يرجى إدخال مبلغ المصروف')} onInput={e => e.target.setCustomValidity('')} className="w-full px-3 py-2 border rounded-xl text-sm text-gray-900" required />
                    <textarea placeholder={t.notes} value={expNotes} onChange={e => setExpNotes(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm h-16 resize-none text-gray-900" />
                    <button type="submit" className="w-full bg-red-600 text-white py-2.5 rounded-xl text-sm font-bold cursor-pointer">{t.saveExpenseBtn}</button>
                  </form>
                </div>

                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border space-y-4">
                  <div className="flex justify-between items-center border-b pb-3 flex-wrap gap-3">
                    <h3 className="font-bold text-gray-900">
                      {selectedDateFilter ? `حركة مركبات تاريخ: ${selectedDateFilter}` : 'سجلات كافة التواريخ'}
                      <span className="text-xs text-blue-600 font-semibold mr-2">({filteredOwnerTx.length} نتيجة)</span>
                    </h3>

                    <div className="flex items-center gap-2 flex-wrap">
                      <input 
                        type="text" 
                        placeholder={t.searchPlate} 
                        value={plateSearchQuery} 
                        onChange={e => setPlateSearchQuery(e.target.value)}
                        className="px-3 py-1.5 border rounded-xl text-xs bg-white text-gray-900 font-bold outline-none focus:ring-2 focus:ring-blue-500"
                      />

                      <input 
                        type="date" 
                        value={selectedDateFilter} 
                        onChange={e => setSelectedDateFilter(e.target.value)}
                        className="px-3 py-1.5 border rounded-xl text-xs bg-white text-gray-900 font-bold"
                      />

                      <button 
                        onClick={() => setSelectedDateFilter(new Date().toISOString().slice(0, 10))}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        {t.today}
                      </button>

                      <button 
                        onClick={() => setSelectedDateFilter('')}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        {t.allRecords}
                      </button>

                      <button 
                        onClick={handleRefreshData} 
                        disabled={isRefreshing}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition border"
                      >
                        <RefreshCw size={14} className={isRefreshing ? "animate-spin text-blue-600" : ""} /> 
                        {isRefreshing ? '...' : t.update}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {filteredOwnerTx.length === 0 ? (
                      <p className="text-xs text-gray-400 py-4 text-center">لا توجد سيارات مسجلة تطابق البحث أو التاريخ المحدد.</p>
                    ) : (
                      filteredOwnerTx.map(t => (
                        <div key={t.id} className="p-3 bg-gray-50 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold block text-gray-900">🏪 {currentShop.name}</span>
                              <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-mono font-bold">التاريخ: {t.date || 'غير محدد'}</span>
                            </div>
                            <span className="font-bold text-blue-600">[{t.vehicleCategory}] {t.carModel} | لوحة: {t.plate}</span> - {t.service}
                            <span className="block text-xs text-gray-500">المبلغ المسجل: {t.price} ليرة | الحالة: {t.method === 'دين' ? 'دين ⚠️' : t.method} {t.notes && `| ملاحظة: ${t.notes}`}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleDeleteTransactionByOwner(selectedShopId, t.id)} className="bg-red-100 text-red-700 px-2.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1"><Trash2 size={13} /> {t.delete || 'حذف'}</button>
                            <button onClick={() => setSelectedInvoice({ ...t, shopName: currentShop.name, shopInfo: currentShop })} className="bg-slate-800 text-white px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1 hover:bg-black"><Printer size={14} /> {t.printInvoice || 'طباعة'}</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'addShop' && (
          <div className="space-y-8 max-w-4xl mx-auto py-2">
            
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-blue-600 to-purple-600"></div>
              
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 text-purple-600 p-3.5 rounded-2xl">
                    <Building size={26} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">
                      {editingShopId ? 'تعديل بيانات فرع المغسلة ✏️' : t.addShopTitle}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {editingShopId ? 'قم بتحديث معلومات الفرع وعامل الفرع أدناه' : t.addShopSub}
                    </p>
                  </div>
                </div>
                {editingShopId && (
                  <button 
                    type="button" 
                    onClick={() => { setEditingShopId(null); setNewShopName(''); setNewWorkerEmail(''); setNewWorkerPass(''); setNewShopPhone(''); setNewShopAddress(''); }}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-bold transition"
                  >
                    إلغاء التعديل ✕
                  </button>
                )}
              </div>

              <form onSubmit={handleOwnerSaveShop} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">{t.branchNamePlaceholder}</label>
                  <input 
                    type="text" 
                    placeholder="مثال: مغسلة النسر - فرع الميناء" 
                    value={newShopName} 
                    onChange={e => setNewShopName(e.target.value)} 
                    onInvalid={e => e.target.setCustomValidity('يرجى إدخال اسم الفرع')}
                    onInput={e => e.target.setCustomValidity('')}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm text-gray-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition font-semibold" 
                    required 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">{t.workerEmailPlaceholder}</label>
                    <input 
                      type="email" 
                      placeholder="worker@gmail.com" 
                      value={newWorkerEmail} 
                      onChange={e => setNewWorkerEmail(e.target.value)} 
                      onInvalid={e => e.target.setCustomValidity('يرجى إدخال بريد العامل')}
                      onInput={e => e.target.setCustomValidity('')}
                      className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm text-gray-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition font-semibold" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">{t.workerPassPlaceholder}</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      value={newWorkerPass} 
                      onChange={e => setNewWorkerPass(e.target.value)} 
                      onInvalid={e => e.target.setCustomValidity('يرجى إدخال كلمة سر العامل')}
                      onInput={e => e.target.setCustomValidity('')}
                      className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm text-gray-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition font-semibold" 
                      required 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">{t.branchPhonePlaceholder} (أقصى 11 رقماً)</label>
                    <input 
                      type="text" 
                      dir="ltr"
                      maxLength={11}
                      placeholder="05XXXXXXXXX" 
                      value={newShopPhone} 
                      onChange={e => setNewShopPhone(e.target.value.replace(/\D/g, '').slice(0, 11))} 
                      className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm text-gray-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition font-semibold text-right" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">{t.branchAddressPlaceholder}</label>
                    <input 
                      type="text" 
                      placeholder="إسكندرون، شارع العصري..." 
                      value={newShopAddress} 
                      onChange={e => setNewShopAddress(e.target.value)} 
                      className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm text-gray-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition font-semibold" 
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-4 rounded-2xl font-bold text-sm cursor-pointer shadow-lg transition transform active:scale-95"
                >
                  {editingShopId ? 'حفظ التعديلات وتحديث الفرع ✏️' : t.addShopBtn}
                </button>
              </form>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 space-y-5">
              <div className="flex justify-between items-center border-b pb-4">
                <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                  <span>🏢</span> {t.myShops} ({ownedShops.length}):
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {ownedShops.map(s => (
                  <div key={s.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white transition shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-3">
                        <h4 className="font-black text-base text-slate-900">🏪 {s.name}</h4>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${s.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {s.status === 'active' ? t.activeStatus : t.suspendedStatus}
                        </span>
                        <span className="text-[11px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold">
                          الباقة: {s.subscriptionType}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 flex items-center gap-1.5">
                        <MapPin size={13} className="text-red-500" /> العنوان: {s.address} | الهاتف: <span dir="ltr">{s.phone}</span>
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1.5">
                        <Mail size={13} className="text-purple-500" /> إيميل العامل: <strong className="text-slate-800 font-mono">{s.workerEmail}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                      <button 
                        onClick={() => handleStartEditShop(s)}
                        className="flex-1 md:flex-initial bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5 transition"
                      >
                        <Edit3 size={14} /> {t.edit}
                      </button>
                      <button 
                        onClick={() => handleDeleteShopByOwner(s.id)}
                        className="flex-1 md:flex-initial bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5 transition"
                      >
                        <Trash2 size={14} /> {t.delete}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {activeTab === 'accounting' && !isAllShops && (
          <div className="bg-white p-8 rounded-3xl shadow-sm border max-w-4xl mx-auto space-y-6" id="accountStatement">
            <div className="text-center border-b pb-4 space-y-1">
              <h2 className="text-2xl font-black text-gray-900">🏪 {currentShop?.name}</h2>
              <p className="text-xs text-gray-600">كشف الحسابات المالي والتقارير والديون | {currentShop?.address} | هاتف: <span dir="ltr">{currentShop?.phone}</span></p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200">
                <span className="text-xs text-blue-900 block font-bold">{t.totalServices}</span>
                <span className="text-lg font-black text-blue-700">{shopTotalServices} ليرة</span>
              </div>
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
                <span className="text-xs text-emerald-900 block font-bold">{t.totalPaid}</span>
                <span className="text-lg font-black text-emerald-700">{shopTotalPaid} ليرة</span>
              </div>
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
                <span className="text-xs text-amber-900 block font-bold">{t.debtsAmount}</span>
                <span className="text-lg font-black text-amber-700">{shopTotalDebtAmount} ليرة</span>
              </div>
              <div className="bg-red-50 p-4 rounded-2xl border border-red-200">
                <span className="text-xs text-red-900 block font-bold">{t.totalExpAmount}</span>
                <span className="text-lg font-black text-red-700">{shopTotalExpenses} ليرة</span>
              </div>
              <div className="bg-purple-50 p-4 rounded-2xl border border-purple-200 md:col-span-1 col-span-2">
                <span className="text-xs text-purple-900 block font-bold">{t.netProfitsAmount}</span>
                <span className="text-lg font-black text-purple-700">{shopNetProfit} ليرة</span>
              </div>
            </div>

            <div className="space-y-3 bg-amber-50 p-5 rounded-2xl border border-amber-200">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-amber-900 text-base flex items-center gap-2">⚠️ سجل الديون على الزبائن:</h4>
                <button 
                  onClick={handleRefreshData} 
                  disabled={isRefreshing}
                  className="bg-white hover:bg-amber-100 text-amber-800 px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition border border-amber-300"
                >
                  <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} /> {t.update}
                </button>
              </div>

              {currentShopDebts.length === 0 ? (
                <p className="text-xs text-gray-600">لا توجد ديون مسجلة على زبائن هذا الفرع.</p>
              ) : (
                <div className="space-y-2">
                  {currentShopDebts.map(d => (
                    <div key={d.id} className="p-3 bg-white rounded-xl shadow-xs flex justify-between items-center text-sm border border-amber-100">
                      <div>
                        <span className="font-bold text-gray-900">👤 الزبون: {d.debtorName}</span>
                        <p className="text-xs text-gray-700">📞 الهاتف: <span dir="ltr">{d.phone}</span> | الخدمة: {d.service}</p>
                        <span className="text-[10px] text-gray-500">التاريخ: {d.date} (بواسطة: {d.addedBy})</span>
                      </div>
                      <span className="text-base font-black text-red-600">{d.amount} ليرة</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-gray-900 border-b pb-2">تفاصيل المصاريف المسجلة:</h4>
              {currentShopExpenses.length === 0 ? <p className="text-xs text-gray-500">لا توجد مصاريف مسجلة لهذا الفرع.</p> : currentShopExpenses.map(e => (
                <div key={e.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded-lg">
                  <span className="text-gray-900 font-medium">{e.title} ({e.category})</span>
                  <span className="text-red-600 font-bold">-{e.amount} ليرة</span>
                </div>
              ))}
            </div>

            <div className="pt-4 flex justify-end">
              <button onClick={() => handlePrintInvoice({ shopName: currentShop.name, shopInfo: currentShop, plate: 'كشف حساب مالي شامل', type: 'جميع العمليات', service: 'تقرير الحسابات والديون والأرباح', startTime: '-', endTime: '-', method: 'تقرير', price: shopNetProfit })} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm cursor-pointer flex items-center gap-2 hover:bg-black"><Printer size={16} /> {t.printPdf}</button>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-white p-8 rounded-3xl shadow-sm border max-w-xl mx-auto space-y-4">
            <h3 className="text-xl font-bold text-gray-900">{t.profileSettings}</h3>
            <form onSubmit={e => { e.preventDefault(); showToast('تم تحديث البيانات بنجاح!', 'success'); }} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t.ownerNameLabel}</label>
                <input type="text" defaultValue={currentUser.ownerName} className="w-full px-3 py-2 border rounded-xl text-sm text-gray-900 font-semibold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t.email}</label>
                <input type="email" defaultValue={currentUser.email} className="w-full px-3 py-2 border rounded-xl text-sm text-gray-900 font-semibold" disabled />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t.taxLabel}</label>
                <input type="text" defaultValue={currentUser.taxNumber} onChange={e => currentUser.taxNumber = e.target.value} className="w-full px-3 py-2 border rounded-xl text-sm text-gray-900 font-semibold" placeholder="أدخل الرقم الضريبي للمؤسسة" />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-sm cursor-pointer">{t.saveProfileBtn}</button>
            </form>
          </div>
        )}
      </main>

      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-lg w-full space-y-6 relative" dir="rtl">
            <div className="space-y-4 text-right">
              <div className="text-center border-b pb-3">
                <h2 className="text-xl font-black text-gray-900">🏪 {selectedInvoice.shopName}</h2>
                <p className="text-xs text-gray-600">{selectedInvoice.shopInfo?.address || 'إسكندرون'} | هاتف: <span dir="ltr">{selectedInvoice.shopInfo?.phone || '+90...'}</span></p>
                <span className="inline-block mt-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold">فاتورة غسيل مركبات رسمية</span>
              </div>
              <div className="space-y-2 text-sm text-gray-800 font-medium">
                <div className="flex justify-between border-b pb-1"><span className="text-gray-600">نوع المركبة:</span><span className="font-bold text-gray-900">{selectedInvoice.vehicleCategory} ({selectedInvoice.vehicleCategory === 'سيارة' ? selectedInvoice.carModel : 'موتور'})</span></div>
                <div className="flex justify-between border-b pb-1"><span className="text-gray-600">رقم اللوحة:</span><span className="font-bold text-gray-900">{selectedInvoice.plate}</span></div>
                <div className="flex justify-between border-b pb-1"><span className="text-gray-600">الخدمة:</span><span className="font-bold text-gray-900">{selectedInvoice.service}</span></div>
                <div className="flex justify-between border-b pb-1"><span className="text-gray-600">طريقة الدفع:</span><span className="font-bold text-gray-900">{selectedInvoice.method === 'دين' ? 'دين (على الذمة)' : selectedInvoice.method}</span></div>
                
                {selectedInvoice.notes && (
                  <div className="flex justify-between border-b pb-1"><span className="text-gray-600">ملاحظات العامل:</span><span className="font-bold text-amber-700">{selectedInvoice.notes}</span></div>
                )}

                {(selectedInvoice.beforePhoto || selectedInvoice.afterPhoto) && (
                  <div className="py-2 border-b">
                    <span className="text-xs text-gray-600 block mb-2 font-bold">توثيق الصور:</span>
                    <div className="flex justify-around gap-2">
                      {selectedInvoice.beforePhoto && (
                        <div className="text-center w-1/2">
                          <span className="text-[10px] text-gray-500 block">قبل الغسيل</span>
                          <img src={selectedInvoice.beforePhoto} alt="قبل" className="w-full h-20 object-cover rounded-lg border mt-1" />
                        </div>
                      )}
                      {selectedInvoice.afterPhoto && (
                        <div className="text-center w-1/2">
                          <span className="text-[10px] text-gray-500 block">بعد الغسيل</span>
                          <img src={selectedInvoice.afterPhoto} alt="بعد" className="w-full h-20 object-cover rounded-lg border mt-1" />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-between text-base font-black bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                  <span className="text-emerald-900">المبلغ الإجمالي:</span><span className="text-emerald-700">{selectedInvoice.price} ليرة</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => handlePrintInvoice(selectedInvoice)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer text-sm shadow-md">
                <Printer size={18} /> {t.printInvoice}
              </button>
              <button onClick={() => setSelectedInvoice(null)} className="px-5 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-bold cursor-pointer text-sm">
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}