import React, { useState, useEffect, useRef } from 'react';
import { 
  Car, Shield, Users, Building, Plus, Printer, Camera, Phone, MapPin, Tag, 
  Settings, DollarSign, Mail, AlertTriangle, Trash2, Edit3, Image as ImageIcon, 
  RefreshCw, Bike, Bell, CheckSquare, Award, FileSpreadsheet, UserPlus, Wallet,
  LogOut, CheckCircle, UsersRound, Globe, ChevronDown, Menu, X, Share2, Search, Calendar, Lock, KeyRound, Check, Banknote,
  BarChart3, TrendingUp, PieChart
} from 'lucide-react';
import { auth, db } from './firebase';
import { initializeApp, getApps } from 'firebase/app';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail, 
  signOut,
  getAuth
} from 'firebase/auth';
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
import { translations } from './translations';

export default function App() {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('carWash_lang') || 'ar';
    } catch (e) {
      return 'ar';
    }
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const t = translations[lang] || translations.ar || {};

  const handleLanguageChange = (newLang) => {
    setLang(newLang);
    try {
      localStorage.setItem('carWash_lang', newLang);
    } catch (e) {}
  };

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

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {}
    setCurrentUser(null);
    localStorage.removeItem('carWash_currentUser');
    setIsSidebarOpen(false);
  };

  // حالات تسجيل الدخول واستعادة كلمة المرور
  const [inputEmail, setInputEmail] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [isForgotPasswordView, setIsForgotPasswordView] = useState(false);
  const [isResendVerificationAvailable, setIsResendVerificationAvailable] = useState(false);
  const [lastUnverifiedUser, setLastUnverifiedUser] = useState(null);

  // تبدأ فارغة لتفادي اختلاط وتداخل بيانات أشخاص آخرين عند F5
  const [shops, setShops] = useState([]);

  // باقات الاشتراك المحفوظة في Firestore
  const [pricingPlans, setPricingPlans] = useState([
    { id: 'plan_1', name: 'باقة شهرية (فرع واحد)', type: 'monthly', durationDays: 30, price: 500, maxShops: 1 },
    { id: 'plan_2', name: 'باقة سنوية (5 فروع)', type: 'yearly', durationDays: 365, price: 5000, maxShops: 5 },
    { id: 'plan_3', name: 'باقة مفتوحة مدى الحياة', type: 'lifetime', durationDays: 99999, price: 15000, maxShops: 10 }
  ]);

  useEffect(() => {
    const unsubPlans = onSnapshot(collection(db, "platformPricingPlans"), (snapshot) => {
      if (!snapshot.empty) {
        const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPricingPlans(fetched);
      } else {
        pricingPlans.forEach(async (p) => {
          await setDoc(doc(db, "platformPricingPlans", String(p.id)), p);
        });
      }
    });
    return () => unsubPlans();
  }, []);

  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanType, setNewPlanType] = useState('');
  const [newPlanPrice, setNewPlanPrice] = useState('');
  const [newPlanMaxShops, setNewPlanMaxShops] = useState('1');
  const [newPlanDays, setNewPlanDays] = useState('30');

  const [editingPlanId, setEditingPlanId] = useState(null);
  const [editPlanName, setEditPlanName] = useState('');
  const [editPlanPrice, setEditPlanPrice] = useState('');
  const [editPlanMaxShops, setEditPlanMaxShops] = useState('');
  const [editPlanDays, setEditPlanDays] = useState('');

  // حالات إضافة العميل الجديد مع قيود إدخال رقم الهاتف (11 رقم فقط)
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientOwnerPass, setNewClientOwnerPass] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientTax, setNewClientTax] = useState('');
  const [selectedTrialOption, setSelectedTrialOption] = useState('1'); // '1' = فرع واحد، '2' = فرعين

  // حالة تعديل العميل
  const [editingClientData, setEditingClientData] = useState(null);

  const [targetClientEmailForDiscount, setTargetClientEmailForDiscount] = useState('');
  const [directDiscountValue, setDirectDiscountValue] = useState('');

  // اليوم بيومه افتراضياً
  const [selectedDateFilter, setSelectedDateFilter] = useState(new Date().toISOString().slice(0, 10));
  const [plateSearchQuery, setPlateSearchQuery] = useState('');

  // حالات قسم التقارير المالية والتشغيلية لصاحب العمل
  const [reportTimeRange, setReportTimeRange] = useState('month'); // 'today' | 'week' | 'month' | 'custom'
  const [reportFromDate, setReportFromDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [reportToDate, setReportToDate] = useState(new Date().toISOString().slice(0, 10));

  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, message: '', onConfirm: null });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 6000);
  };

  // التحقق من رقم الهاتف ليكون 11 رقم بالضبط في جميع مدخلات الأرقام
  const validateTurkishPhone = (phone) => {
    if (!phone) return true;
    const cleanPhone = String(phone).replace(/\D/g, '');
    return cleanPhone.length === 11;
  };

  const handlePhoneInputChange = (e, setter) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 11);
    setter(val);
  };

  const translateVehicleCategory = (cat) => {
    if (cat === 'سيارة' || cat === 'Otomobil' || cat === 'Car') return t.car || 'سيارة';
    if (cat === 'موتور' || cat === 'Motosiklet' || cat === 'Motorcycle') return t.motorcycle || 'دراجة نارية';
    return cat || t.car || 'سيارة';
  };

  const translatePaymentMethod = (method) => {
    if (method === 'كاش' || method === 'Nakit' || method === 'Cash') return t.cash || 'كاش';
    if (method === 'بنك' || method === 'Banka' || method === 'Bank') return t.bank || 'بنك';
    if (method === 'دين' || method === 'Veresiye' || method === 'Debt') return t.debt || 'دين';
    return method;
  };

  const translateServiceType = (srv) => {
    if (!srv) return '';
    const list = t.servicesList || ['غسيل خارجي فقط', 'غسيل خارجي وداخلي', 'غسيل وتلميع كامل', 'غسيل موتور'];
    if (srv.includes('خارجي فقط') || srv.includes('Sadece Dış') || srv.includes('Exterior Wash Only')) return list[0];
    if (srv.includes('خارجي وداخلي') || srv.includes('İç ve Dış') || srv.includes('Interior & Exterior')) return list[1];
    if (srv.includes('تلميع') || srv.includes('Detaylı') || srv.includes('Full Wash')) return list[2];
    if (srv.includes('موتور') || srv.includes('Motor')) return list[3];
    return srv;
  };

  // جلب الفروع ومزامنة الجلسة
  useEffect(() => {
    const unsubShops = onSnapshot(collection(db, "platformShops"), (snapshot) => {
      const fetchedShops = snapshot.docs.map(doc => ({ id: Number(doc.id) || doc.id, ...doc.data() }));
      setShops(fetchedShops);

      setCurrentUser(prev => {
        if (!prev) return null;
        if (prev.role === 'owner') {
          const updatedOwnedShops = fetchedShops.filter(s => s.ownerEmail && s.ownerEmail.toLowerCase() === prev.email.toLowerCase());
          return { ...prev, ownedShops: updatedOwnedShops };
        }
        if (prev.role === 'worker') {
          const currentShop = fetchedShops.find(s => String(s.id) === String(prev.shopId));
          if (currentShop) {
            return { ...prev, shopName: currentShop.name, shopInfo: currentShop };
          }
        }
        return prev;
      });
    });
    return () => unsubShops();
  }, []);

  const carBrandsLibrary = [
    "Toyota", "BMW", "Mercedes-Benz", "Audi", "Volkswagen",
    "Hyundai", "Kia", "Fiat", "Renault", "Ford",
    "Nissan", "Honda", "Skoda", "Peugeot", "Opel",
    "Togg", "Chery", "Dacia", "Suzuki", "Mitsubishi",
    "Mazda", "Chevrolet", "Jeep", "Volvo", "Porsche",
    "Land Rover", "MG", "Geely", "Tesla", "Citroën",
    "Seat", "Subaru", "Mini", "Lexus", "Alfa Romeo", "Other"
  ];

  const [transactions, setTransactions] = useState({});
  const [expenses, setExpenses] = useState({});
  const [debts, setDebts] = useState({});
  const [debtRepayments, setDebtRepayments] = useState({});
  const [announcements, setAnnouncements] = useState({});

  useEffect(() => {
    if (!currentUser || shops.length === 0) return;
    const unsubscribes = [];

    let relevantShops = [];
    if (currentUser.role === 'programmer') {
      relevantShops = shops;
    } else if (currentUser.role === 'owner') {
      relevantShops = shops.filter(s => s.ownerEmail && s.ownerEmail.toLowerCase() === currentUser.email.toLowerCase());
    } else if (currentUser.role === 'worker') {
      relevantShops = shops.filter(s => String(s.id) === String(currentUser.shopId));
    }

    relevantShops.forEach(shop => {
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
  }, [currentUser?.email, currentUser?.role, currentUser?.shopId, shops]);

  const [selectedShopId, setSelectedShopId] = useState(1);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [programmerTab, setProgrammerTab] = useState('clients'); 
  const [selectedClientEmail, setSelectedClientEmail] = useState(null);

  // تبويب العامل داخل شاشته
  const [workerActiveTab, setWorkerActiveTab] = useState('washes'); // 'washes' | 'expenses' | 'debts'

  const [newShopName, setNewShopName] = useState('');
  const [newWorkerEmail, setNewWorkerEmail] = useState('');
  const [newWorkerPass, setNewWorkerPass] = useState('');
  const [newShopPhone, setNewShopPhone] = useState('');
  const [newShopAddress, setNewShopAddress] = useState('');
  const [ownerTaxNumber, setOwnerTaxNumber] = useState('');
  const [editingShopId, setEditingShopId] = useState(null);

  // حالة صرف رواتب العمال في لوحة صاحب العمل
  const [salaryWorkerShopId, setSalaryWorkerShopId] = useState('');
  const [salaryAmount, setSalaryAmount] = useState('');
  const [salaryNotes, setSalaryNotes] = useState('');

  const [ownerNoticeTitle, setOwnerNoticeTitle] = useState('');
  const [ownerNoticeText, setOwnerNoticeText] = useState('');
  const [announcementDate, setAnnouncementDate] = useState(new Date().toISOString().slice(0, 10));

  const [vehicleCategory, setVehicleCategory] = useState('سيارة');
  const [carModel, setCarModel] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [workerSearchPlate, setWorkerSearchPlate] = useState(''); // بحث برقم النمرة في شاشة العامل
  const [serviceType, setServiceType] = useState(''); // سيبناها تبدأ فارغة ليختار العامل بدقة
  const [customServiceName, setCustomServiceName] = useState(''); // لخيار "أخرى"
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

  // متغيرات الفروع والحسابات المشتقة لصاحب العمل والعامل
  const allOwnerRecords = currentUser?.role === 'owner'
    ? shops.filter(s => s.ownerEmail && s.ownerEmail.toLowerCase() === currentUser.email.toLowerCase())
    : [];
  const realOwnedShops = allOwnerRecords.filter(s => !s.isProfileOnly);
  const masterOwnerAccount = allOwnerRecords.find(s => s.isProfileOnly) || allOwnerRecords[0] || {};
  const isAllShops = selectedShopId === 'all';
  const currentShop = currentUser?.role === 'worker'
    ? (shops.find(s => String(s.id) === String(currentUser.shopId)) || currentUser.shopInfo)
    : realOwnedShops.find(s => String(s.id) === String(selectedShopId)) || realOwnedShops[0] || null;

  useEffect(() => {
    if (currentUser?.role === 'owner' && realOwnedShops.length > 0) {
      if (selectedShopId !== 'all' && !realOwnedShops.some(s => String(s.id) === String(selectedShopId))) {
        setSelectedShopId(realOwnedShops[0].id);
      }
      if (!salaryWorkerShopId) {
        setSalaryWorkerShopId(String(realOwnedShops[0].id));
      }
    }
  }, [currentUser?.role, realOwnedShops.length, selectedShopId]);

  const handleRefreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast(t.refreshSuccess || 'تم تحديث البيانات بنجاح', 'success');
    }, 600);
  };

  // تسجيل الدخول مع شرط تفعيل Gmail الصارم للعميل والعامل
  const handleFirebaseLogin = async (e) => {
    e.preventDefault();
    if (!inputEmail || !inputPassword) return showToast(t.enterEmailPass || 'يرجى إدخال البريد وكلمة المرور', 'error');

    const cleanEmail = inputEmail.trim().toLowerCase();
    const cleanPass = inputPassword.trim();

    try {
      // 1. حساب المدير العام / المبرمج
      if (cleanEmail === "munir@gmail.com") {
        try {
          await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
        } catch (authErr) {
          if (authErr.code === 'auth/user-not-found' || authErr.code === 'auth/invalid-credential') {
            try { await createUserWithEmailAndPassword(auth, cleanEmail, cleanPass); } catch (e) {}
          }
        }
        setCurrentUser({ email: cleanEmail, role: 'programmer', name: 'المبرمج (المدير العام)' });
        return;
      }

      // 2. فحص تسجيل دخول العامل (Worker)
      const targetShop = shops.find(s => 
        s.workerEmail && 
        s.workerEmail.trim().toLowerCase() === cleanEmail && 
        String(s.workerPass || '').trim() === cleanPass
      );

      if (targetShop) {
        if (targetShop.status === 'suspended') {
          showToast(t.suspendedShopMsg || 'تم إيقاف هذا الفرع', 'error');
          return;
        }

        try {
          const workerCred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
          if (!workerCred.user.emailVerified) {
            setLastUnverifiedUser(workerCred.user);
            setIsResendVerificationAvailable(true);
            showToast(t.workerEmailNotVerifiedMsg || 'يرجى تفعيل بريد العامل عبر Gmail قبل تسجيل الدخول', 'error');
            return;
          }
        } catch (authErr) {}

        const workerData = {
          email: cleanEmail,
          role: 'worker',
          shopId: targetShop.id,
          shopName: targetShop.name,
          shopInfo: targetShop
        };
        setCurrentUser(workerData);
        showToast('تم تسجيل دخول العامل بنجاح', 'success');
        return;
      }

      // 3. فحص تسجيل دخول صاحب المغسلة (Owner)
      const ownedShops = shops.filter(s => s.ownerEmail && s.ownerEmail.trim().toLowerCase() === cleanEmail);
      if (ownedShops.length > 0) {
        const firstShop = ownedShops[0];
        const activeOrValidShops = ownedShops.filter(s => s.status !== 'suspended');
        if (activeOrValidShops.length === 0) {
          showToast(t.suspendedAccountMsg || 'تم تجميد هذا الحساب مؤقتاً', 'error');
          return;
        }

        try {
          const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
          const user = userCredential.user;

          if (!user.emailVerified) {
            setLastUnverifiedUser(user);
            setIsResendVerificationAvailable(true);
            showToast(t.emailNotVerifiedMsg || 'يرجى تأكيد حسابك أولاً بالضغط على الرابط المرسل إلى Gmail', 'error');
            return;
          }
        } catch (authErr) {
          if (String(firstShop.ownerPass || '').trim() === cleanPass) {
          } else {
            showToast(t.loginError || 'بيانات الدخول غير صحيحة', 'error');
            return;
          }
        }

        const realShops = ownedShops.filter(s => !s.isProfileOnly);
        const userData = {
          email: cleanEmail,
          role: 'owner',
          ownerName: firstShop.owner,
          taxNumber: firstShop.taxNumber || (t.unregistered || 'غير مسجل'),
          ownedShops: realShops
        };
        setCurrentUser(userData);
        if (realShops.length > 0) {
          const activeFirst = realShops.find(s => s.status !== 'suspended') || realShops[0];
          setSelectedShopId(activeFirst.id);
        } else {
          setSelectedShopId('none');
        }
        return;
      }

      showToast(t.loginError || 'بيانات الدخول غير صحيحة', 'error');
    } catch (error) {
      console.error(error);
      showToast(t.loginFailed || 'فشل تسجيل الدخول', 'error');
    }
  };

  const handleResendVerification = async () => {
    if (!lastUnverifiedUser) return;
    try {
      await sendEmailVerification(lastUnverifiedUser);
      showToast(t.verificationEmailSent || 'تم إرسال رابط تأكيد جديد إلى بريدك الإلكتروني', 'success');
      setIsResendVerificationAvailable(false);
    } catch (e) {
      showToast('يرجى الانتظار قليلاً قبل إعادة المحاولة', 'error');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!inputEmail) {
      showToast(t.enterEmailFirst || 'يرجى إدخال البريد أولاً', 'error');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, inputEmail.trim().toLowerCase());
      showToast(t.resetSent || 'تم إرسال رابط استعادة كلمة المرور إلى Gmail', 'success');
      setIsForgotPasswordView(false);
    } catch (error) {
      console.error(error);
      showToast(t.resetError || 'حدث خطأ أثناء إرسال الرابط، تأكد من صحة البريد', 'error');
    }
  };

  // إضافة العميل الجديد مع التحقق من رقم الهاتف 11 رقم بالضبط
  const handleProgrammerAddClient = async (e) => {
    e.preventDefault();
    if (!newClientName || !newClientEmail || !newClientOwnerPass) {
      showToast(t.fillClientFieldsError || 'يرجى ملء كافة بيانات العميل المطلوبة', 'error');
      return;
    }

    if (newClientPhone && !validateTurkishPhone(newClientPhone)) {
      showToast(t.invalidPhoneError || 'رقم الهاتف يجب أن يكون 11 رقماً بالضبط', 'error');
      return;
    }

    const cleanOwnerEmail = newClientEmail.trim().toLowerCase();

    const emailExistsInShops = shops.some(s => 
      (s.ownerEmail && s.ownerEmail.trim().toLowerCase() === cleanOwnerEmail) ||
      (s.workerEmail && s.workerEmail.trim().toLowerCase() === cleanOwnerEmail)
    );

    if (emailExistsInShops) {
      showToast(t.emailAlreadyExistsError || 'عذراً، هذا البريد الإلكتروني مسجل مسبقاً في النظام!', 'error');
      return;
    }

    try {
      try {
        const secondaryAppName = 'SecondaryAuthApp';
        let secondaryApp = getApps().find(app => app.name === secondaryAppName);
        if (!secondaryApp) {
          secondaryApp = initializeApp(auth.app.options, secondaryAppName);
        }
        const secondaryAuth = getAuth(secondaryApp);
        const ownerPassword = newClientOwnerPass || '123456';
        
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, cleanOwnerEmail, ownerPassword);
        await sendEmailVerification(userCredential.user);
        await signOut(secondaryAuth);
      } catch (authCreateErr) {
        if (authCreateErr.code === 'auth/email-already-in-use') {
          showToast(t.emailAlreadyExistsError || 'هذا البريد مسجل مسبقاً في المنظومة!', 'error');
          return;
        }
      }

      const shopId = Date.now();
      const trialExpiry = new Date();
      trialExpiry.setDate(trialExpiry.getDate() + 7);
      const trialExpiryStr = trialExpiry.toISOString().slice(0, 10);
      const maxShopsCount = selectedTrialOption === '2' ? 2 : 1;
      const trialPackageTitle = selectedTrialOption === '2' 
        ? (t.trialPlan2Branches || 'تجربة مجانية 7 أيام (فرعين)')
        : (t.trialPlan1Branch || 'تجربة مجانية 7 أيام (فرع واحد)');

      const newClientShopObj = {
        id: shopId,
        name: '',
        isProfileOnly: true,
        owner: newClientName.trim(),
        ownerEmail: cleanOwnerEmail,
        ownerPass: newClientOwnerPass || '123456',
        taxNumber: newClientTax.trim() || (t.unregistered || 'غير مسجل'),
        workerEmail: '',
        workerPass: '',
        phone: newClientPhone.trim() || '+90 ...',
        address: (t.unspecified || 'غير محدد'),
        code: 'OWNER-' + Math.floor(100 + Math.random() * 900),
        status: 'active',
        subscriptionType: trialPackageTitle,
        subscriptionExpiry: trialExpiryStr,
        maxAllowedShops: maxShopsCount,
        discountPercent: 0,
        suspendedAt: null
      };

      await setDoc(doc(db, "platformShops", String(shopId)), newClientShopObj);

      setNewClientName('');
      setNewClientEmail('');
      setNewClientOwnerPass('');
      setNewClientPhone('');
      setNewClientTax('');
      setSelectedTrialOption('1');

      showToast(t.clientAddedSuccess || 'تم تسجيل العميل وتفعيل التجربة المجانية وإرسال رابط التفعيل إلى Gmail', 'success');
      setProgrammerTab('clients');
      setSelectedClientEmail(null);
    } catch (error) {
      showToast((t.clientAddError || 'خطأ أثناء الإضافة: ') + error.message, 'error');
    }
  };

  // حذف العميل وكافة فروعه نهائياً
  const handleDeleteClientCompletely = (clientEmail) => {
    setConfirmModal({
      isOpen: true,
      message: `تحذير هام: هل أنت متأكد من حذف العميل (${clientEmail}) وكافة فروعه وسجلاته نهائياً من قاعدة البيانات؟ لا يمكن التراجع عن هذا الإجراء!`,
      onConfirm: async () => {
        try {
          const clientShops = shops.filter(s => s.ownerEmail && s.ownerEmail.toLowerCase() === clientEmail.toLowerCase());
          for (const shop of clientShops) {
            await deleteDoc(doc(db, "platformShops", String(shop.id)));
          }
          setSelectedClientEmail(null);
          showToast('تم حذف العميل وكافة فروعه نهائياً من قاعدة البيانات', 'success');
        } catch (e) {
          showToast('حدث خطأ أثناء حذف العميل: ' + e.message, 'error');
        }
        setConfirmModal({ isOpen: false, message: '', onConfirm: null });
      }
    });
  };

  // حفظ التعديلات على بيانات العميل
  const handleSaveClientEdits = async (e) => {
    e.preventDefault();
    if (!editingClientData) return;

    if (editingClientData.phone && !validateTurkishPhone(editingClientData.phone)) {
      showToast(t.invalidPhoneError || 'رقم الهاتف يجب أن يكون 11 رقماً بالضبط', 'error');
      return;
    }

    try {
      const clientShops = shops.filter(s => s.ownerEmail && s.ownerEmail.toLowerCase() === editingClientData.ownerEmail.toLowerCase());
      for (const shop of clientShops) {
        await updateDoc(doc(db, "platformShops", String(shop.id)), {
          owner: editingClientData.ownerName.trim(),
          taxNumber: editingClientData.taxNumber.trim(),
          phone: editingClientData.phone.trim(),
          ownerPass: editingClientData.ownerPass || shop.ownerPass || '123456'
        });
      }
      setEditingClientData(null);
      showToast(t.clientUpdatedSuccess || 'تم تعديل بيانات العميل بنجاح في قاعدة البيانات', 'success');
    } catch (e) {
      showToast(t.updateError || 'حدث خطأ أثناء التحديث: ' + e.message, 'error');
    }
  };

  const handleApplyDirectDiscountToClient = async (e) => {
    e.preventDefault();
    if (!targetClientEmailForDiscount || directDiscountValue === '') {
      showToast(t.selectClientAndDiscount || 'يرجى اختيار العميل وتحديد نسبة الخصم', 'error');
      return;
    }

    try {
      const clientShops = shops.filter(s => s.ownerEmail.toLowerCase() === targetClientEmailForDiscount.toLowerCase());
      for (const shop of clientShops) {
        await updateDoc(doc(db, "platformShops", String(shop.id)), {
          discountPercent: Number(directDiscountValue)
        });
      }
      const rawMsg = t.discountAppliedSuccess || 'تم تطبيق الخصم {val}% بنجاح';
      const msg = String(rawMsg).replace('{val}', directDiscountValue);
      showToast(msg, 'success');
      setDirectDiscountValue('');
      setTargetClientEmailForDiscount('');
    } catch (e) {
      showToast(t.discountError || 'حدث خطأ أثناء تطبيق الخصم', 'error');
    }
  };

  const handleRemoveDiscountFromClient = async (clientEmail) => {
    try {
      const clientShops = shops.filter(s => s.ownerEmail && s.ownerEmail.toLowerCase() === clientEmail.toLowerCase());
      for (const shop of clientShops) {
        await updateDoc(doc(db, "platformShops", String(shop.id)), {
          discountPercent: 0
        });
      }
      showToast(t.discountRemovedSuccess || 'تم إلغاء الخصم بنجاح', 'success');
    } catch (e) {
      showToast(t.updateError || 'حدث خطأ أثناء التحديث', 'error');
    }
  };

  const handleSuspendClientForMonths = (clientEmail) => {
    setConfirmModal({
      isOpen: true,
      message: t.confirmSuspendClient || 'هل أنت متأكد من تجميد حساب هذا العميل؟',
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
          showToast(t.clientSuspendedSuccess || 'تم إيقاف العميل مؤقتاً', 'success');
        } catch (e) {
          showToast(t.suspendError || 'حدث خطأ أثناء الإيقاف', 'error');
        }
        setConfirmModal({ isOpen: false, message: '', onConfirm: null });
      }
    });
  };

  const handleUpdateClientSubscription = async (clientEmail, planObj) => {
    let expiryDate = '';
    const now = new Date();
    const days = planObj.durationDays ? Number(planObj.durationDays) : 30;

    if (planObj.type === 'lifetime' || days > 3000) {
      expiryDate = t.lifetimeDuration || 'مدى الحياة';
    } else {
      now.setDate(now.getDate() + days);
      expiryDate = now.toISOString().slice(0, 10);
    }

    const maxShops = Number(planObj.maxShops) || 1;

    try {
      const clientShops = shops.filter(s => s.ownerEmail.toLowerCase() === clientEmail.toLowerCase());
      for (const shop of clientShops) {
        await updateDoc(doc(db, "platformShops", String(shop.id)), {
          subscriptionType: planObj.name,
          subscriptionExpiry: expiryDate,
          maxAllowedShops: maxShops,
          status: 'active',
          suspendedAt: null,
          gracePeriodExpiry: null
        });
      }
      showToast(t.subRenewedSuccess ? t.subRenewedSuccess.replace('{email}', clientEmail) : 'تم تجديد الاشتراك بنجاح', 'success');
    } catch (e) {
      showToast(t.renewError || 'حدث خطأ أثناء تجديد الاشتراك', 'error');
    }
  };

  const handleRemoveClientSubscription = (clientEmail) => {
    setConfirmModal({
      isOpen: true,
      message: t.confirmRemoveSub || 'هل أنت متأكد من إلغاء اشتراك هذا العميل؟',
      onConfirm: async () => {
        try {
          const clientShops = shops.filter(s => s.ownerEmail.toLowerCase() === clientEmail.toLowerCase());
          for (const shop of clientShops) {
            await updateDoc(doc(db, "platformShops", String(shop.id)), {
              subscriptionType: 'expired',
              subscriptionExpiry: t.expiredDuration || 'منتهي الصلاحية',
              status: 'suspended'
            });
          }
          showToast(t.subRemovedSuccess || 'تم إلغاء الاشتراك بنجاح', 'success');
        } catch (e) {
          showToast(t.updateError || 'حدث خطأ أثناء التحديث', 'error');
        }
        setConfirmModal({ isOpen: false, message: '', onConfirm: null });
      }
    });
  };

  const handleSuspendShop = (shopId) => {
    setConfirmModal({
      isOpen: true,
      message: t.confirmSuspendShop || 'هل أنت متأكد من إيقاف هذا الفرع؟',
      onConfirm: async () => {
        try {
          await updateDoc(doc(db, "platformShops", String(shopId)), {
            status: 'suspended',
            suspendedAt: new Date().toISOString()
          });
          showToast(t.shopSuspendedSuccess || 'تم إيقاف الفرع بنجاح', 'success');
        } catch (e) {
          showToast(t.suspendShopError || 'حدث خطأ أثناء إيقاف الفرع', 'error');
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
      showToast(t.shopActivatedSuccess || 'تم تفعيل الفرع بنجاح', 'success');
    } catch (e) {
      showToast(t.updateError || 'حدث خطأ أثناء التفعيل', 'error');
    }
  };

  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    if (!ownerNoticeTitle || !ownerNoticeText || selectedShopId === 'all') {
      return showToast(t.announcementFillError || 'يرجى إكمال بيانات الإعلان', 'error');
    }
    
    try {
      await addDoc(collection(db, "shops", String(selectedShopId), "announcements"), {
        title: ownerNoticeTitle,
        text: ownerNoticeText,
        date: announcementDate
      });
      setOwnerNoticeTitle('');
      setOwnerNoticeText('');
      showToast(t.announcementAddedSuccess || 'تم إرسال التعميم بنجاح', 'success');
    } catch (error) {
      showToast(t.announcementError || 'حدث خطأ أثناء الإرسال', 'error');
    }
  };

  const handleDeleteAnnouncement = (shopId, annId) => {
    setConfirmModal({
      isOpen: true,
      message: t.confirmDeleteAnn || 'هل أنت متأكد من حذف هذا التعميم؟',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, "shops", String(shopId), "announcements", String(annId)));
          showToast(t.announcementDeletedSuccess || 'تم حذف التعميم بنجاح', 'success');
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
        notes: repayNotes || 'تسديد دين',
        date: repayDate
      });
      setSettlingDebtId(null);
      setRepayNotes('');
      const rawMsg = t.debtSettledSuccess || 'تم تسديد دين {name} بمبلغ {amount} بنجاح';
      const msg = String(rawMsg).replace('{name}', debtObj.debtorName).replace('{amount}', debtObj.amount);
      showToast(msg, 'success');
    } catch (error) {
      showToast(t.settleError || 'حدث خطأ أثناء التسديد', 'error');
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
          showToast(t.imageProcessError || 'خطأ أثناء معالجة الصورة', 'error');
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handlePrintInvoice = (inv) => {
    if (!inv) return;
    try {
      let iframe = document.getElementById('print-invoice-iframe');
      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = 'print-invoice-iframe';
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        iframe.style.visibility = 'hidden';
        document.body.appendChild(iframe);
      }

      const invoiceHTML = `
        <!DOCTYPE html>
        <html lang="${lang}" dir="${t.dir || 'rtl'}">
        <head>
          <meta charset="UTF-8">
          <title>${t.officialInvoiceBadge || 'فاتورة رسمية'} - ${inv.plate}</title>
          <style>
            @page { size: auto; margin: 10mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Tahoma, sans-serif; padding: 15px; text-align: ${t.dir === 'rtl' ? 'right' : 'left'}; color: #0f172a; margin: 0; }
            .box { max-width: 450px; margin: auto; border: 2px solid #0f172a; padding: 20px; border-radius: 16px; }
            .center { text-align: center; border-bottom: 2px dashed #94a3b8; padding-bottom: 12px; margin-bottom: 15px; }
            .center h2 { margin: 0 0 6px 0; font-size: 20px; }
            .center p { margin: 0; font-size: 12px; color: #475569; }
            .row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; border-bottom: 1px dotted #e2e8f0; padding-bottom: 4px; }
            .photos { display: flex; justify-content: space-around; margin-top: 15px; border-top: 1px dashed #94a3b8; padding-top: 10px; }
            .photos div { text-align: center; width: 45%; }
            .photos img { width: 100%; height: 95px; object-fit: cover; border-radius: 8px; border: 1px solid #cbd5e1; margin-top: 4px; }
            .total { background: #ecfdf5; color: #047857; padding: 12px; text-align: center; font-size: 16px; font-weight: bold; margin-top: 15px; border-radius: 12px; border: 1px solid #a7f3d0; }
          </style>
        </head>
        <body>
          <div class="box">
            <div class="center">
              <h2>🏪 ${inv.shopName || 'مغسلة السيارات'}</h2>
              <p>${inv.shopInfo?.address || 'İskenderun'} | ${t.phoneLabel || 'الهاتف:'} <span dir="ltr">${inv.shopInfo?.phone || '+90...'}</span></p>
            </div>
            <div class="row"><span>${t.vehicleCatLabel || 'المركبة:'}</span><strong>${translateVehicleCategory(inv.vehicleCategory)} (${inv.carModel || ''})</strong></div>
            <div class="row"><span>${t.plateNumber || 'رقم اللوحة:'}</span><strong>${inv.plate}</strong></div>
            <div class="row"><span>${t.serviceNameLabel || 'الخدمة:'}</span><strong>${translateServiceType(inv.service)}</strong></div>
            <div class="row"><span>${t.startTimePlaceholder || 'البداية'} / ${t.endTimePlaceholder || 'النهاية'}:</span><strong>${inv.startTime || '-'} ➔ ${inv.endTime || '-'}</strong></div>
            <div class="row"><span>${t.paymentMethod || 'طريقة الدفع:'}</span><strong>${translatePaymentMethod(inv.method)}</strong></div>
            ${inv.notes ? `<div class="row"><span>${t.notesOptional || 'الملاحظات:'}</span><strong>${inv.notes}</strong></div>` : ''}

            ${(inv.beforePhoto || inv.afterPhoto) ? `
              <div class="photos">
                ${inv.beforePhoto ? `<div><span style="font-size:10px; font-weight:bold;">${t.beforeBadge || 'قبل الغسيل'}</span><img src="${inv.beforePhoto}"/></div>` : ''}
                ${inv.afterPhoto ? `<div><span style="font-size:10px; font-weight:bold;">${t.afterBadge || 'بعد الغسيل'}</span><img src="${inv.afterPhoto}"/></div>` : ''}
              </div>
            ` : ''}

            <div class="total">${t.totalInvoiceAmount || 'المبلغ الإجمالي:'} ${inv.price} ${t.currency || 'ليرة'}</div>
          </div>
        </body>
        </html>
      `;

      const doc = iframe.contentWindow.document;
      doc.open();
      doc.write(invoiceHTML);
      doc.close();

      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      }, 400);

      showToast(t.preparingPrint || 'جاري تحضير الطباعة...', 'success');
    } catch (e) {
      window.print();
    }
  };

  const handleShareWhatsApp = (inv) => {
    if (!inv) return;
    const shopName = inv.shopName || 'مغسلة السيارات';
    const plate = inv.plate || '-';
    const vehicle = `${translateVehicleCategory(inv.vehicleCategory)} ${inv.carModel ? `(${inv.carModel})` : ''}`.trim();
    const service = translateServiceType(inv.service) || '-';
    const price = `${inv.price || 0} ${t.currency || 'ليرة'}`;
    const method = translatePaymentMethod(inv.method) || '-';
    const timing = `${inv.startTime || '-'} ➔ ${inv.endTime || '-'}`;
    const notes = inv.notes ? `\n📝 *ملاحظات:* ${inv.notes}` : '';

    const message = 
      `🧾 *${t.officialInvoiceBadge || 'فاتورة رسمية'} - ${shopName}*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🚗 *${t.vehicleCatLabel || 'المركبة:'}* ${vehicle}\n` +
      `🔢 *${t.plateNumber || 'اللوحة:'}* ${plate}\n` +
      `✨ *${t.serviceNameLabel || 'الخدمة:'}* ${service}\n` +
      `⏱️ *${t.startTimePlaceholder || 'البداية'}/${t.endTimePlaceholder || 'النهاية'}:* ${timing}\n` +
      `💳 *${t.paymentMethod || 'طريقة الدفع:'}* ${method}\n` +
      `💰 *${t.totalInvoiceAmount || 'الإجمالي:'}* ${price}` +
      `${notes}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🙏 *شكراً لتعاملكم معنا!*`;

    const encoded = encodeURIComponent(message);
    let phoneParam = '';
    const rawTargetPhone = inv.phone || inv.debtorPhone;
    if (rawTargetPhone) {
      const cleanDigits = String(rawTargetPhone).replace(/\D/g, '');
      if (cleanDigits.length >= 10) {
        phoneParam = `phone=${cleanDigits}&`;
      }
    }

    const whatsappUrl = `https://api.whatsapp.com/send?${phoneParam}text=${encoded}`;
    window.open(whatsappUrl, '_blank');
  };

  // حفظ الفرع بواسطة صاحب المغسلة مع التحقق من رقم الهاتف 11 رقم بالضبط
  const handleOwnerSaveShop = async (e) => {
    e.preventDefault();
    if (!newShopName || !newWorkerEmail || !newWorkerPass) {
      return showToast(t.fillShopFieldsError || 'يرجى ملء جميع الحقول المطلوبة', 'error');
    }

    if (newShopPhone && !validateTurkishPhone(newShopPhone)) {
      showToast(t.invalidPhoneError || 'رقم الهاتف يجب أن يكون 11 رقماً بالضبط', 'error');
      return;
    }

    const cleanWorkerEmail = newWorkerEmail.trim().toLowerCase();
    const cleanWorkerPass = newWorkerPass.trim();

    const workerEmailExists = shops.some(s => 
      String(s.id) !== String(editingShopId) &&
      s.workerEmail && 
      s.workerEmail.trim().toLowerCase() === cleanWorkerEmail
    );

    if (workerEmailExists) {
      showToast(t.emailAlreadyExistsError || 'عذراً، بريد العامل هذا مسجل مسبقاً في النظام!', 'error');
      return;
    }

    const ownedShops = shops.filter(s => s.ownerEmail && s.ownerEmail.toLowerCase() === (currentUser?.email || '').toLowerCase());
    const realShops = ownedShops.filter(s => !s.isProfileOnly);
    
    const masterAccount = ownedShops.find(s => s.isProfileOnly) || ownedShops[0] || {};
    const maxAllowed = masterAccount.maxAllowedShops ? Number(masterAccount.maxAllowedShops) : 1;

    if (!editingShopId && realShops.length >= maxAllowed) {
      const rawTemplate = t.planLimitReachedError || 'عذراً، باقتك الحالية تسمح بفتح {limit} فرع فقط.';
      const msg = String(rawTemplate).replace('{limit}', maxAllowed);
      showToast(msg, 'error');
      return;
    }

    try {
      try {
        const secondaryAppName = 'SecondaryAuthApp_Worker';
        let secondaryApp = getApps().find(app => app.name === secondaryAppName);
        if (!secondaryApp) {
          secondaryApp = initializeApp(auth.app.options, secondaryAppName);
        }
        const secondaryAuth = getAuth(secondaryApp);
        const userCred = await createUserWithEmailAndPassword(secondaryAuth, cleanWorkerEmail, cleanWorkerPass);
        await sendEmailVerification(userCred.user);
        await signOut(secondaryAuth);
      } catch (workerAuthErr) {}

      const shopId = editingShopId ? editingShopId : Date.now();
      const trialExpiry = new Date();
      trialExpiry.setDate(trialExpiry.getDate() + 7);

      const existingShop = shops.find(s => String(s.id) === String(shopId)) || {};

      const baseSubscriptionType = masterAccount.subscriptionType || existingShop.subscriptionType || (t.trialPackageName || 'تجربة مجانية');
      const baseSubscriptionExpiry = masterAccount.subscriptionExpiry || existingShop.subscriptionExpiry || trialExpiry.toISOString().slice(0, 10);
      const baseMaxShops = maxAllowed;

      const shopObj = {
        id: Number(shopId) || shopId,
        name: newShopName.trim(),
        owner: currentUser?.ownerName || masterAccount.owner || 'مالك المغسلة',
        ownerEmail: currentUser?.email || masterAccount.ownerEmail || '',
        taxNumber: currentUser?.taxNumber || masterAccount.taxNumber || ownerTaxNumber || (t.unregistered || 'غير مسجل'),
        workerEmail: cleanWorkerEmail,
        workerPass: cleanWorkerPass,
        phone: newShopPhone.trim() || '+90 ...',
        address: newShopAddress.trim() || (t.unspecified || 'غير محدد'),
        code: existingShop.code || ('SHOP-' + Math.floor(100 + Math.random() * 900)),
        status: existingShop.status || 'active',
        subscriptionType: baseSubscriptionType,
        subscriptionExpiry: baseSubscriptionExpiry,
        maxAllowedShops: baseMaxShops,
        discountPercent: existingShop.discountPercent || masterAccount.discountPercent || 0,
        suspendedAt: existingShop.suspendedAt || null
      };

      await setDoc(doc(db, "platformShops", String(shopId)), shopObj);

      if (!editingShopId && masterAccount.isProfileOnly) {
        await deleteDoc(doc(db, "platformShops", String(masterAccount.id)));
      }

      setNewShopName('');
      setNewWorkerEmail('');
      setNewWorkerPass('');
      setNewShopPhone('');
      setNewShopAddress('');
      setEditingShopId(null);
      setSelectedShopId(shopId);
      
      showToast(editingShopId ? (t.shopUpdatedSuccess || 'تم التعديل بنجاح') : (t.shopAddedSuccess || 'تم تسجيل الفرع وإرسال رابط التحقق إلى بريد العامل'), 'success');
    } catch (error) {
      showToast((t.saveError || 'خطأ أثناء الحفظ: ') + error.message, 'error');
    }
  };

  const handleStartEditShop = (shop) => {
    setEditingShopId(shop.id);
    setNewShopName(shop.name);
    setNewWorkerEmail(shop.workerEmail || '');
    setNewWorkerPass(shop.workerPass || '');
    setNewShopPhone(shop.phone || '');
    setNewShopAddress(shop.address || '');
    setActiveTab('addShop');
    setIsSidebarOpen(false);
  };

  const handleDeleteShopByOwner = (shopId) => {
    setConfirmModal({
      isOpen: true,
      message: t.confirmDeleteShop || 'هل أنت متأكد من حذف هذا الفرع نهائياً؟',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, "platformShops", String(shopId)));
          const ownerEmail = currentUser.email.toLowerCase();
          const updatedOwnedShops = shops.filter(s => s.ownerEmail && s.ownerEmail.toLowerCase() === ownerEmail && String(s.id) !== String(shopId));
          setCurrentUser(prev => ({
            ...prev,
            ownedShops: updatedOwnedShops
          }));
          if (String(selectedShopId) === String(shopId)) {
            setSelectedShopId(updatedOwnedShops[0]?.id || 'none');
          }
          showToast(t.shopDeletedSuccess || 'تم حذف الفرع بنجاح', 'success');
        } catch (e) {
          showToast(t.deleteShopError || 'خطأ أثناء حذف الفرع', 'error');
        }
        setConfirmModal({ isOpen: false, message: '', onConfirm: null });
      }
    });
  };

  const handleDeleteTransactionByOwner = (shopId, txId) => {
    setConfirmModal({
      isOpen: true,
      message: t.confirmDeleteTx || 'هل أنت متأكد من حذف هذا السجل؟',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, "shops", String(shopId), "transactions", String(txId)));
          showToast(t.txDeletedSuccess || 'تم حذف العملية بنجاح', 'success');
        } catch (e) {}
        setConfirmModal({ isOpen: false, message: '', onConfirm: null });
      }
    });
  };

  const handleStartEditTransaction = (tItem) => {
    setEditingTxId(tItem.id);
    setVehicleCategory(tItem.vehicleCategory || 'سيارة');
    setCarModel(tItem.carModel || '');
    setPlateNumber(tItem.plate);
    setServiceType(tItem.service);
    setPrice(tItem.price);
    setPayMethod(tItem.method);
    setTxNotes(tItem.notes || '');
    setStartTime(tItem.startTime);
    setEndTime(tItem.endTime);
    if (tItem.beforePhoto) setBeforePhoto(tItem.beforePhoto);
    if (tItem.afterPhoto) setAfterPhoto(tItem.afterPhoto);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!plateNumber || !price || !currentUser) return showToast(t.fillPlatePriceError || 'يرجى إدخال اللوحة والسعر', 'error');
    const shopId = currentUser.role === 'worker' ? currentUser.shopId : selectedShopId;
    if (!shopId || shopId === 'all' || shopId === 'none') return showToast(t.selectSpecificShopError || 'يرجى تحديد فرع مخصص', 'error');

    if (debtorPhone && !validateTurkishPhone(debtorPhone)) {
      showToast(t.invalidPhoneError || 'رقم الهاتف يجب أن يكون 11 رقماً بالضبط', 'error');
      return;
    }

    const finalServiceType = serviceType === 'أخرى' ? (customServiceName.trim() || 'أخرى') : serviceType;

    try {
      const todayDateStr = new Date().toISOString().slice(0, 10);
      if (editingTxId) {
        await updateDoc(doc(db, "shops", String(shopId), "transactions", String(editingTxId)), {
          vehicleCategory, carModel: vehicleCategory === 'سيارة' ? carModel : 'دراجة نارية', plate: plateNumber.trim().toUpperCase(), service: finalServiceType, price: Number(price), paid: payMethod === 'دين' ? 0 : Number(price), method: payMethod, notes: txNotes, startTime, endTime, beforePhoto, afterPhoto
        });
        setEditingTxId(null);
        showToast(t.txUpdatedSuccess || 'تم تحديث العملية بنجاح', 'success');
      } else {
        await addDoc(collection(db, "shops", String(shopId), "transactions"), {
          vehicleCategory, carModel: vehicleCategory === 'سيارة' ? carModel : 'دراجة نارية', plate: plateNumber.trim().toUpperCase(), service: finalServiceType, price: Number(price), paid: payMethod === 'دين' ? 0 : Number(price), method: payMethod, notes: txNotes, startTime, endTime, date: todayDateStr, beforePhoto, afterPhoto
        });
        if (payMethod === 'دين') {
          await addDoc(collection(db, "shops", String(shopId), "debts"), {
            debtorName: debtorName.trim() || plateNumber.trim().toUpperCase(), phone: debtorPhone.trim(), service: finalServiceType, amount: Number(price), date: todayDateStr, addedBy: 'عامل الفرع'
          });
          setDebtorName(''); setDebtorPhone('');
        }
        showToast(t.txAddedSuccess || 'تم حفظ العملية بنجاح', 'success');
      }
      setPlateNumber(''); setCarModel(''); setPrice(''); setTxNotes(''); setBeforePhoto(null); setAfterPhoto(null); setCustomServiceName('');
    } catch (e) { showToast((t.saveError || 'خطأ: ') + e.message, 'error'); }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    const shopId = currentUser.role === 'worker' ? currentUser.shopId : selectedShopId;
    if (!expTitle || !expAmount || !shopId || shopId === 'all' || shopId === 'none') return showToast(t.fillExpFieldsError || 'يرجى ملء تفاصيل المصروف', 'error');
    
    try {
      const todayDateStr = new Date().toISOString().slice(0, 10);
      await addDoc(collection(db, "shops", String(shopId), "expenses"), {
        category: expCategory, 
        title: expTitle.trim(), 
        amount: Number(expAmount), 
        notes: expNotes, 
        date: todayDateStr, 
        time: new Date().toLocaleTimeString()
      });
      setExpTitle(''); setExpAmount(''); setExpNotes('');
      showToast(t.expAddedSuccess || 'تم تسجيل المصروف بنجاح', 'success');
    } catch (e) { showToast(t.expError || 'خطأ أثناء تسجيل المصروف', 'error'); }
  };

  // دالة صرف أجور العمال من قبل صاحب المغسلة (تُدرج كبند مصروف رسمي)
  const handleOwnerPayWorkerSalary = async (e) => {
    e.preventDefault();
    if (!salaryWorkerShopId || !salaryAmount) {
      return showToast('يرجى اختيار الفرع وإدخال مبلغ الأجر', 'error');
    }

    const targetShop = realOwnedShops.find(s => String(s.id) === String(salaryWorkerShopId));
    if (!targetShop) return showToast('الفرع غير موجود', 'error');

    try {
      const todayDateStr = new Date().toISOString().slice(0, 10);
      await addDoc(collection(db, "shops", String(salaryWorkerShopId), "expenses"), {
        category: 'رواتب وأجور العمال',
        title: `أجر/راتب عامل: ${targetShop.workerEmail}`,
        amount: Number(salaryAmount),
        notes: salaryNotes || 'دفعة راتب / يومية عامل',
        date: todayDateStr,
        time: new Date().toLocaleTimeString()
      });

      setSalaryAmount('');
      setSalaryNotes('');
      showToast(`تم صرف وتسجيل الأجر بمبلغ ${salaryAmount} ${t.currency || 'ليرة'} بنجاح`, 'success');
    } catch (e) {
      showToast('خطأ أثناء تسجيل الراتب: ' + e.message, 'error');
    }
  };

  const handleSaveOwnerProfile = async (e) => {
    e.preventDefault();
    try {
      for (const s of allOwnerRecords) {
        await updateDoc(doc(db, "platformShops", String(s.id)), {
          owner: currentUser.ownerName,
          taxNumber: currentUser.taxNumber
        });
      }
      showToast(t.profileUpdatedSuccess || 'تم تحديث الملف الشخصي بنجاح', 'success');
    } catch (err) {
      showToast(t.updateError || 'حدث خطأ أثناء التحديث', 'error');
    }
  };

  const handleAddPricingPlan = async (e) => {
    e.preventDefault();
    if (!newPlanName || !newPlanPrice || !newPlanMaxShops) {
      showToast(t.fillPlanFieldsError || 'يرجى ملء جميع حقول الخطة', 'error');
      return;
    }
    const planId = 'plan_' + Date.now();
    const newPlanObj = {
      id: planId,
      name: newPlanName.trim(),
      type: newPlanType ? newPlanType.toLowerCase().replace(/\s+/g, '_') : planId,
      durationDays: Number(newPlanDays) || 30,
      price: Number(newPlanPrice),
      maxShops: Number(newPlanMaxShops)
    };

    try {
      await setDoc(doc(db, "platformPricingPlans", planId), newPlanObj);
      setNewPlanName('');
      setNewPlanType('');
      setNewPlanPrice('');
      setNewPlanMaxShops('1');
      setNewPlanDays('30');
      showToast(t.planAddedSuccess || 'تمت إضافة الباقة بنجاح', 'success');
    } catch (err) {
      showToast('خطأ أثناء حفظ الباقة: ' + err.message, 'error');
    }
  };

  const handleDeletePricingPlan = async (planId) => {
    if (pricingPlans.length <= 1) {
      showToast(t.onePlanMustRemain || 'يجب أن تتبقى خطة واحدة على الأقل', 'error');
      return;
    }
    setConfirmModal({
      isOpen: true,
      message: t.confirmDeletePlan || 'هل أنت متأكد من حذف هذه الخطة؟',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, "platformPricingPlans", String(planId)));
          showToast(t.planDeletedSuccess || 'تم حذف الخطة', 'success');
        } catch (err) {
          showToast('خطأ أثناء الحذف', 'error');
        }
        setConfirmModal({ isOpen: false, message: '', onConfirm: null });
      }
    });
  };

  const handleStartEditPlan = (plan) => {
    setEditingPlanId(plan.id);
    setEditPlanName(plan.name);
    setEditPlanPrice(plan.price);
    setEditPlanMaxShops(plan.maxShops);
    setEditPlanDays(plan.durationDays || 30);
  };

  const handleSaveEditPlan = async (planId) => {
    try {
      await updateDoc(doc(db, "platformPricingPlans", String(planId)), {
        name: editPlanName.trim(),
        price: Number(editPlanPrice),
        maxShops: Number(editPlanMaxShops),
        durationDays: Number(editPlanDays) || 30
      });
      setEditingPlanId(null);
      showToast(t.planUpdatedSuccess || 'تم تعديل الخطة', 'success');
    } catch (err) {
      showToast('خطأ أثناء التعديل: ' + err.message, 'error');
    }
  };

  // دوال حساب وطباعة ومشاركة تقرير الأداء المالي
  const getOwnerReportData = () => {
    let fromD = '';
    let toD = new Date().toISOString().slice(0, 10);

    if (reportTimeRange === 'today') {
      fromD = toD;
    } else if (reportTimeRange === 'week') {
      const w = new Date();
      w.setDate(w.getDate() - 7);
      fromD = w.toISOString().slice(0, 10);
    } else if (reportTimeRange === 'month') {
      const m = new Date();
      m.setDate(1);
      fromD = m.toISOString().slice(0, 10);
    } else if (reportTimeRange === 'custom') {
      fromD = reportFromDate;
      toD = reportToDate;
    }

    const filteredShopIds = isAllShops ? realOwnedShops.map(s => s.id) : [currentShop?.id].filter(Boolean);

    let reportTx = [];
    let reportExp = [];
    let reportRepay = [];

    filteredShopIds.forEach(id => {
      const txList = transactions[id] || [];
      const expList = expenses[id] || [];
      const repList = debtRepayments[id] || [];

      txList.forEach(tItem => {
        if (!fromD || (tItem.date >= fromD && tItem.date <= toD)) {
          reportTx.push(tItem);
        }
      });

      expList.forEach(eItem => {
        if (!fromD || (eItem.date >= fromD && eItem.date <= toD)) {
          reportExp.push(eItem);
        }
      });

      repList.forEach(rItem => {
        if (!fromD || (rItem.date >= fromD && rItem.date <= toD)) {
          reportRepay.push(rItem);
        }
      });
    });

    const totalRevenue = reportTx.reduce((acc, curr) => acc + Number(curr.paid || 0), 0) + 
                         reportRepay.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
    
    const totalExpenses = reportExp.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
    const netProfit = totalRevenue - totalExpenses;

    const totalCarsCount = reportTx.filter(t => t.vehicleCategory === 'سيارة').length;
    const totalBikesCount = reportTx.filter(t => t.vehicleCategory === 'موتور').length;

    const servicesMap = {};
    reportTx.forEach(tItem => {
      const sName = translateServiceType(tItem.service) || 'أخرى';
      if (!servicesMap[sName]) servicesMap[sName] = { count: 0, revenue: 0 };
      servicesMap[sName].count += 1;
      servicesMap[sName].revenue += Number(tItem.price || 0);
    });

    const cashTotal = reportTx.filter(t => t.method === 'كاش').reduce((acc, curr) => acc + Number(curr.paid || 0), 0) + 
                      reportRepay.filter(r => r.method === 'كاش').reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
    
    const bankTotal = reportTx.filter(t => t.method === 'بنك').reduce((acc, curr) => acc + Number(curr.paid || 0), 0) + 
                      reportRepay.filter(r => r.method === 'بنك').reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

    const debtTotal = reportTx.filter(t => t.method === 'دين').reduce((acc, curr) => acc + Number(curr.price || 0), 0);

    return {
      fromD,
      toD,
      shopName: isAllShops ? (t.combinedAllShopsTitle || 'جميع الفروع') : (currentShop?.name || 'مغسلتي'),
      totalRevenue,
      totalExpenses,
      netProfit,
      totalWashes: reportTx.length,
      totalCarsCount,
      totalBikesCount,
      servicesMap,
      cashTotal,
      bankTotal,
      debtTotal
    };
  };

  const handlePrintComprehensiveReport = () => {
    const data = getOwnerReportData();
    let iframe = document.getElementById('print-invoice-iframe');
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'print-invoice-iframe';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      iframe.style.visibility = 'hidden';
      document.body.appendChild(iframe);
    }

    const servicesRows = Object.keys(data.servicesMap).map(sName => {
      const item = data.servicesMap[sName];
      const pct = data.totalRevenue > 0 ? Math.round((item.revenue / data.totalRevenue) * 100) : 0;
      return `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${sName}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.count}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.revenue} ${t.currency || 'ليرة'}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: center;">%${pct}</td>
        </tr>
      `;
    }).join('');

    const reportHTML = `
      <!DOCTYPE html>
      <html lang="${lang}" dir="${t.dir || 'rtl'}">
      <head>
        <meta charset="UTF-8">
        <title>تقرير الأداء والمبيعات - ${data.shopName}</title>
        <style>
          @page { size: auto; margin: 12mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Tahoma, sans-serif; padding: 20px; text-align: ${t.dir === 'rtl' ? 'right' : 'left'}; color: #0f172a; margin: 0; }
          .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 20px; }
          .grid { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 20px; }
          .card { flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; text-align: center; }
          .card span { font-size: 11px; color: #64748b; font-weight: bold; display: block; }
          .card strong { font-size: 18px; margin-top: 4px; display: block; color: #0f172a; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }
          th { background: #0f172a; color: white; padding: 10px; text-align: ${t.dir === 'rtl' ? 'right' : 'left'}; }
          .net { background: #ecfdf5; border: 1px solid #a7f3d0; color: #047857; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2 style="margin: 0 0 5px 0;">🏪 ${data.shopName}</h2>
          <p style="margin: 0; font-size: 13px; color: #475569;">تقرير الأداء المالي والتشغيلي (الفترة: ${data.fromD || 'البداية'} ➔ ${data.toD})</p>
        </div>

        <div class="grid">
          <div class="card"><span>إجمالي المبيعات</span><strong>${data.totalRevenue} ${t.currency || 'ليرة'}</strong></div>
          <div class="card"><span>إجمالي المصروفات</span><strong style="color: #dc2626;">-${data.totalExpenses} ${t.currency || 'ليرة'}</strong></div>
          <div class="card net"><span>صافي الأرباح</span><strong style="color: #047857;">${data.netProfit} ${t.currency || 'ليرة'}</strong></div>
          <div class="card"><span>إجمالي الآليات المغسولة</span><strong style="color: #2563eb;">${data.totalWashes}</strong></div>
        </div>

        <h3 style="font-size: 15px; margin-top: 25px; margin-bottom: 10px;">📊 تفصيل الخدمات الأكثر طلباً:</h3>
        <table>
          <thead>
            <tr><th>الخدمة</th><th style="text-align: center;">العمليات</th><th style="text-align: center;">المجموع</th><th style="text-align: center;">النسبة</th></tr>
          </thead>
          <tbody>
            ${servicesRows || '<tr><td colspan="4" style="text-align:center; padding:15px;">لا توجد عمليات</td></tr>'}
          </tbody>
        </table>

        <div style="margin-top: 30px; font-size: 11px; text-align: center; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px;">
          تم إنشاء هذا التقرير تلقائياً بواسطة نظام إدارة مغاسل السيارات السحابي • ${new Date().toLocaleString()}
        </div>
      </body>
      </html>
    `;

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(reportHTML);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }, 400);

    showToast('جاري تحضير وطباعة التقرير الشامل...', 'success');
  };

  const handleShareReportWhatsApp = () => {
    const data = getOwnerReportData();
    const message = 
      `📊 *تقرير الأداء المالي والتشغيلي - ${data.shopName}*\n` +
      `📅 *الفترة:* من ${data.fromD || 'البداية'} إلى ${data.toD}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `💰 *إجمالي المبيعات:* ${data.totalRevenue} ${t.currency || 'ليرة'}\n` +
      `💸 *إجمالي المصروفات والأجور:* ${data.totalExpenses} ${t.currency || 'ليرة'}\n` +
      `📈 *صافي الأرباح:* ${data.netProfit} ${t.currency || 'ليرة'}\n` +
      `🚗 *المركبات المغسولة:* ${data.totalWashes} (سيارات: ${data.totalCarsCount} | مواتير: ${data.totalBikesCount})\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `💵 *كاش:* ${data.cashTotal} ${t.currency || 'ليرة'} | 💳 *بنك:* ${data.bankTotal} ${t.currency || 'ليرة'}\n` +
      `🙏 *نظام إدارة مغاسل السيارات السحابي*`;

    const encoded = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(whatsappUrl, '_blank');
  };

  // تجميع بيانات العملاء للمبرمج مع حساب إجمالي إيرادات الاشتراكات المحققة في المنصة
  const clientsMap = {};
  let totalPlatformRevenue = 0;

  shops.forEach(s => {
    if (!s.ownerEmail) return;
    const key = s.ownerEmail.toLowerCase();
    if (!clientsMap[key]) {
      // محاولة تقدير سعر الباقة الحالية للعميل لتقرير مبيعات الاشتراكات الشامل
      let planPriceVal = 500; // افتراضي باقة شهرية
      const subTypeLower = String(s.subscriptionType || '').toLowerCase();
      if (subTypeLower.includes('سنوية') || subTypeLower.includes('yearly')) planPriceVal = 5000;
      else if (subTypeLower.includes('مدى الحياة') || subTypeLower.includes('lifetime')) planPriceVal = 15000;
      else if (subTypeLower.includes('تجربة') || subTypeLower.includes('trial')) planPriceVal = 0;

      clientsMap[key] = {
        ownerEmail: s.ownerEmail,
        ownerName: s.owner || 'عميل',
        ownerPass: s.ownerPass || '123456',
        phone: s.phone || '+90...',
        taxNumber: s.taxNumber || (t.unregistered || 'غير مسجل'),
        subscriptionType: s.subscriptionType || (t.trialPackageName || 'تجربة مجانية'),
        subscriptionExpiry: s.subscriptionExpiry || '-',
        maxAllowedShops: s.maxAllowedShops || 1,
        discountPercent: s.discountPercent || 0,
        status: s.status || 'active',
        planPrice: planPriceVal,
        allRecords: [],
        realBranches: []
      };
    }
    clientsMap[key].allRecords.push(s);
    if (!s.isProfileOnly) {
      clientsMap[key].realBranches.push(s);
    }
    if (s.status === 'active') {
      clientsMap[key].status = 'active';
    }
  });

  const allClientsList = Object.values(clientsMap);
  const activeClientsList = allClientsList.filter(c => c.status !== 'suspended');
  const suspendedClientsList = allClientsList.filter(c => c.status === 'suspended');
  const vipClientsList = activeClientsList.filter(c => c.realBranches.length >= 3);
  const regularClientsList = activeClientsList.filter(c => c.realBranches.length < 3);

  // حساب إجمالي أرباح ومبيعات الاشتراكات في المنصة
  totalPlatformRevenue = allClientsList.reduce((sum, c) => sum + (c.status !== 'suspended' ? Number(c.planPrice || 0) : 0), 0);

  // حساب إحصائيات صاحب العمل الحالية (لنظرة عامة وكشف الحساب)
  const targetOwnerShopIds = isAllShops
    ? realOwnedShops.map(s => s.id)
    : (currentShop ? [currentShop.id] : []);

  let ownerFilteredTransactions = [];
  let ownerAllTransactions = [];
  let ownerExpensesList = [];
  let ownerDebtsList = [];
  let ownerRepaymentsList = [];

  targetOwnerShopIds.forEach(sId => {
    const sObj = realOwnedShops.find(sh => String(sh.id) === String(sId));
    const txArr = (transactions[sId] || []).map(item => ({ ...item, shopId: sId, shopName: sObj?.name || 'الفرع', shopInfo: sObj }));
    const expArr = (expenses[sId] || []).map(item => ({ ...item, shopId: sId, shopName: sObj?.name || 'الفرع' }));
    const debtArr = (debts[sId] || []).map(item => ({ ...item, shopId: sId, shopName: sObj?.name || 'الفرع' }));
    const repArr = (debtRepayments[sId] || []).map(item => ({ ...item, shopId: sId, shopName: sObj?.name || 'الفرع' }));

    ownerAllTransactions.push(...txArr);
    ownerExpensesList.push(...expArr);
    ownerDebtsList.push(...debtArr);
    ownerRepaymentsList.push(...repArr);
  });

  ownerFilteredTransactions = ownerAllTransactions.filter(tx => {
    const matchesDate = !selectedDateFilter || tx.date === selectedDateFilter;
    const matchesPlate = !plateSearchQuery || (tx.plate && tx.plate.toLowerCase().includes(plateSearchQuery.trim().toLowerCase()));
    return matchesDate && matchesPlate;
  });

  const ownerCashCollected = ownerAllTransactions.filter(tItem => tItem.method === 'كاش').reduce((s, i) => s + Number(i.paid || 0), 0)
    + ownerRepaymentsList.filter(r => r.method === 'كاش').reduce((s, i) => s + Number(i.amount || 0), 0);
  const ownerBankCollected = ownerAllTransactions.filter(tItem => tItem.method === 'بنك').reduce((s, i) => s + Number(i.paid || 0), 0)
    + ownerRepaymentsList.filter(r => r.method === 'بنك').reduce((s, i) => s + Number(i.amount || 0), 0);
  const ownerTotalPendingDebts = ownerDebtsList.reduce((s, i) => s + Number(i.amount || 0), 0);
  const ownerTotalExpenses = ownerExpensesList.reduce((s, i) => s + Number(i.amount || 0), 0);
  const ownerNetProfit = (ownerCashCollected + ownerBankCollected) - ownerTotalExpenses;

  // بيانات التقرير الشامل لصاحب العمل
  const currentReportStats = currentUser?.role === 'owner' ? getOwnerReportData() : null;

  // النوافذ المساعدة
  const renderToastComponent = () => {
    if (!toast) return null;
    return (
      <div className="fixed bottom-5 inset-x-4 z-50 max-w-sm mx-auto animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-2xl border text-xs sm:text-sm font-bold ${
          toast.type === 'error'
            ? 'bg-red-950/95 text-red-100 border-red-800 shadow-red-950/30'
            : 'bg-slate-900/95 text-emerald-300 border-slate-700 shadow-slate-950/30'
        }`}>
          {toast.type === 'error' ? <AlertTriangle size={18} className="text-red-400 shrink-0" /> : <CheckCircle size={18} className="text-emerald-400 shrink-0" />}
          <span className="flex-1">{toast.message}</span>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white cursor-pointer">
            <X size={15} />
          </button>
        </div>
      </div>
    );
  };

  const renderConfirmModal = () => {
    if (!confirmModal.isOpen) return null;
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-150">
          <div className="flex items-center gap-3 text-amber-600">
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">{t.confirmRequired || 'تأكيد الإجراء'}</h3>
              <p className="text-xs text-slate-500">{t.confirmSub || 'يرجى التأكد قبل المتابعة'}</p>
            </div>
          </div>
          <p className="text-sm text-slate-700 font-semibold leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
            {confirmModal.message}
          </p>
          <div className="flex gap-2 justify-end pt-2">
            <button
              onClick={() => setConfirmModal({ isOpen: false, message: '', onConfirm: null })}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition"
            >
              {t.cancel || 'إلغاء'}
            </button>
            <button
              onClick={confirmModal.onConfirm}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer shadow-lg shadow-red-600/20 transition"
            >
              {t.confirmExecute || 'تنفيذ'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderInvoiceModal = () => {
    if (!selectedInvoice) return null;
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center border-b border-dashed border-slate-200 pb-3">
            <div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {t.officialInvoiceBadge || 'فاتورة إلكترونية معتمدة'}
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-1">
                🏪 {selectedInvoice.shopName || currentShop?.name || 'مغسلة السيارات'}
              </h3>
            </div>
            <button onClick={() => setSelectedInvoice(null)} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer">
              <X size={18} />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">{t.vehicleCatLabel || 'نوع المركبة:'}</span>
              <span className="font-bold text-slate-900">{translateVehicleCategory(selectedInvoice.vehicleCategory)} {selectedInvoice.carModel ? `(${selectedInvoice.carModel})` : ''}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">{t.plateNumber || 'رقم اللوحة:'}</span>
              <span className="font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md" dir="ltr">{selectedInvoice.plate}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">{t.serviceNameLabel || 'نوع الخدمة:'}</span>
              <span className="font-bold text-slate-900">{translateServiceType(selectedInvoice.service)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">{t.startTimePlaceholder || 'البداية'} / {t.endTimePlaceholder || 'النهاية'}:</span>
              <span className="font-bold text-slate-900" dir="ltr">{selectedInvoice.startTime || '-'} ➔ {selectedInvoice.endTime || '-'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">{t.paymentMethod || 'طريقة الدفع:'}</span>
              <span className="font-bold text-slate-900">{translatePaymentMethod(selectedInvoice.method)}</span>
            </div>
            {selectedInvoice.notes && (
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">{t.notesOptional || 'ملاحظات:'}</span>
                <span className="font-bold text-slate-800">{selectedInvoice.notes}</span>
              </div>
            )}
          </div>

          {(selectedInvoice.beforePhoto || selectedInvoice.afterPhoto) && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              {selectedInvoice.beforePhoto && (
                <div className="text-center">
                  <span className="text-[11px] font-bold text-slate-500 block mb-1">{t.beforeBadge || 'قبل الغسيل'}</span>
                  <img src={selectedInvoice.beforePhoto} alt="Before" className="w-full h-24 object-cover rounded-xl border border-slate-200" />
                </div>
              )}
              {selectedInvoice.afterPhoto && (
                <div className="text-center">
                  <span className="text-[11px] font-bold text-slate-500 block mb-1">{t.afterBadge || 'بعد الغسيل'}</span>
                  <img src={selectedInvoice.afterPhoto} alt="After" className="w-full h-24 object-cover rounded-xl border border-slate-200" />
                </div>
              )}
            </div>
          )}

          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-2xl text-center font-black text-base">
            {t.totalInvoiceAmount || 'المبلغ الإجمالي:'} {selectedInvoice.price} {t.currency || 'ليرة'}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => handlePrintInvoice(selectedInvoice)}
              className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-2xl text-xs font-bold cursor-pointer transition"
            >
              <Printer size={16} />
              {t.printPdfBtn || 'طباعة / حفظ PDF'}
            </button>
            <button
              onClick={() => handleShareWhatsApp(selectedInvoice)}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl text-xs font-bold cursor-pointer transition"
            >
              <Share2 size={16} />
              {t.whatsappShareBtn || 'مشاركة واتساب'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // دالة الشريط الجانبي الموحد بتصميم تطبيقات الموبايل (Slide-Over Mobile Drawer) مع تصحيح وتوضيح الأسماء في البار العلوي
  const renderMobileSidebarDrawer = (menuItems, currentActiveKey, onSelectTab, roleTitle, roleSubtitle, showOwnerShopSelector = false) => {
    if (!isSidebarOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex">
        {/* خلفية معتمة عند فتح القائمة الجانبية */}
        <div
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          onClick={() => setIsSidebarOpen(false)}
        />

        {/* صندوق القائمة الجانبية */}
        <aside className="relative z-10 w-80 max-w-[85vw] bg-slate-950 text-white h-full flex flex-col justify-between border-e border-slate-800 shadow-2xl overflow-y-auto animate-in slide-in-from-start duration-200">
          {/* رأس الشريط الجانبي */}
          <div className="p-5 space-y-4 border-b border-slate-800/80 bg-gradient-to-b from-slate-900 to-slate-950">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative bg-gradient-to-tr from-blue-600 to-cyan-500 p-2.5 rounded-2xl shadow-lg shadow-blue-500/30">
                  {currentUser?.role === 'programmer' ? <Shield size={22} /> : <Car size={22} />}
                  <span className="absolute -top-1 -end-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                </div>
                <div>
                  <h2 className="font-black text-sm text-white leading-tight">{roleTitle}</h2>
                  <p className="text-[11px] text-emerald-400 font-bold mt-0.5">{roleSubtitle}</p>
                </div>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 cursor-pointer transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* معلومات الباقة واختيار الفرع داخل الشريط الجانبي لصاحب المغسلة */}
            {showOwnerShopSelector && (
              <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
                <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800 text-[11px] space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">{t.packageCounterLabel || 'صلاحية الباقة:'}</span>
                    <span className="font-bold text-blue-400">{masterOwnerAccount.subscriptionType || t.trialPackageName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">{t.expiresIn || 'تنتهي في:'}</span>
                    <span className="font-bold text-emerald-400">{masterOwnerAccount.subscriptionExpiry || '-'}</span>
                  </div>
                </div>

                {realOwnedShops.length > 0 && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block px-1">
                      {t.selectedBranchLabel || 'الفرع المعروض'}:
                    </label>
                    <select
                      value={selectedShopId}
                      onChange={e => {
                        setSelectedShopId(e.target.value === 'all' ? 'all' : (Number(e.target.value) || e.target.value));
                        setIsSidebarOpen(false);
                      }}
                      className="w-full bg-slate-900 text-white text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-800 outline-none cursor-pointer"
                    >
                      <option value="all">
                        📊 {(t.combinedReportOption || 'تقرير شامل ({count} فروع)').replace('{count}', realOwnedShops.length)}
                      </option>
                      {realOwnedShops.map(shop => (
                        <option key={shop.id} value={shop.id}>
                          🏪 {shop.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* قائمة أقسام التطبيق داخل الشريط الجانبي */}
          <div className="p-3 flex-1 space-y-1.5">
            <span className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
              {t.workerNavigationTitle || 'القائمة الرئيسية'}
            </span>
            {menuItems.map(item => {
              const IconComp = item.icon;
              const isActive = currentActiveKey === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold cursor-pointer transition-all duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <IconComp size={18} className={isActive ? 'text-white' : 'text-blue-400'} />
                  <span className="flex-1 text-start">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* أسفل الشريط الجانبي: تغيير اللغة + تسجيل الخروج */}
          <div className="p-4 border-t border-slate-800/80 bg-slate-900/60 space-y-3">
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 px-1">
                <Globe size={13} className="text-blue-400" />
                {t.langPickerTitle || 'اللغة'}
              </span>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                <button onClick={() => handleLanguageChange('ar')} className={`py-1.5 rounded-xl text-xs font-bold cursor-pointer transition ${lang === 'ar' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>🇸🇦 عربي</button>
                <button onClick={() => handleLanguageChange('tr')} className={`py-1.5 rounded-xl text-xs font-bold cursor-pointer transition ${lang === 'tr' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>🇹🇷 TR</button>
                <button onClick={() => handleLanguageChange('en')} className={`py-1.5 rounded-xl text-xs font-bold cursor-pointer transition ${lang === 'en' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>🇺🇸 EN</button>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-red-600/90 hover:bg-red-600 text-white py-3 rounded-2xl text-xs font-bold cursor-pointer shadow-lg shadow-red-600/20 transition active:scale-95"
            >
              <LogOut size={16} />
              <span>{t.logout || 'تسجيل الخروج'}</span>
            </button>
          </div>
        </aside>
      </div>
    );
  };

  // دالة البار العلوي المدمج والمتحرك لتطبيق الموبايل مع إظهار التنبيهات من الأعلى وبمدة ظهور قصيرة (تختفي بضغطات أو تلقائياً)
  const renderMobileTopBar = (title, subtitle, currentSectionLabel, badgeText) => (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-xl text-white border-b border-slate-800/90 shadow-xl">
      {/* خط إضاءة علوي متحرك */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-500 animate-pulse" />

      {/* شريط الإعلانات والتهنئة المتحرك من الأعلى وبمدة ظهور قصيرة */}
      <div className="bg-slate-900/95 border-b border-slate-800/70 px-3 py-1.5 flex items-center justify-between text-[11px] animate-in fade-in duration-300">
        <div className="flex items-center gap-2 text-emerald-400 font-bold truncate">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
          <span className="truncate">🚀 {t.topBarAlertMessage || 'نظام إدارة مغاسل السيارات السحابي الآمن • جاهز للعمل'}</span>
        </div>
        {badgeText && (
          <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-extrabold shrink-0">
            {badgeText}
          </span>
        )}
      </div>

      {/* صف البار العلوي الرئيسي للموبايل (مع وضوح تام للأسماء والعناوين بخط عريض وواضح) */}
      <div className="px-3.5 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30 active:scale-95 cursor-pointer transition shrink-0"
            aria-label="Menu"
          >
            <Menu size={22} />
          </button>

          <div className="min-w-0">
            <h1 className="font-black text-base sm:text-lg text-white truncate tracking-wide">{title}</h1>
            <p className="text-xs text-cyan-300 font-bold truncate flex items-center gap-1.5 mt-0.5">
              <span className="bg-cyan-950/80 px-2 py-0.5 rounded-md border border-cyan-800/50">{currentSectionLabel}</span>
              {subtitle ? <span className="text-slate-300 font-semibold">• {subtitle}</span> : null}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleRefreshData}
            className="p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-100 border border-slate-800 cursor-pointer active:scale-95 transition shadow-sm"
            title={t.refreshData || 'تحديث'}
          >
            <RefreshCw size={18} className={isRefreshing ? 'animate-spin text-cyan-400' : ''} />
          </button>
        </div>
      </div>
    </header>
  );

  // قوائم الشريط الجانبي لكل دور
  const programmerMenuItems = [
    { id: 'clients', label: t.activeClientsTab || 'العملاء النشطون', icon: Users, badge: activeClientsList.length },
    { id: 'suspended', label: t.suspendedClientsTab || 'الحسابات المعلقة', icon: AlertTriangle, badge: suspendedClientsList.length },
    { id: 'addClient', label: t.addClientTab || 'إضافة عميل', icon: UserPlus },
    { id: 'plans', label: t.pricingPlansTab || 'إدارة الباقات والاشتراكات', icon: Award },
    { id: 'discounts', label: t.directDiscountsTab || 'الخصومات المباشرة', icon: Tag },
    { id: 'report', label: t.subscriptionsReportTab || 'تقارير العملاء ومبيعات الاشتراكات', icon: FileSpreadsheet } // تم استكمال وإثراء هذا القسم بالكامل
  ];

  const ownerMenuItems = [
    { id: 'dashboard', label: t.overviewTab || 'نظرة عامة والمالية', icon: PieChart },
    { id: 'addShop', label: t.manageBranchesTab || 'إدارة الفروع', icon: Building, badge: realOwnedShops.length },
    { id: 'accounting', label: t.accountingTab || 'كشف الحسابات', icon: Wallet },
    { id: 'reports', label: t.reportsTab || 'التقارير المالية والتشغيلية', icon: BarChart3 },
    { id: 'profile', label: t.profileTab || 'بيانات الحساب', icon: Settings }
  ];

  const workerMenuItems = [
    { id: 'washes', label: t.workerWashesTab || 'تسجيل واستقبال السيارات', icon: Car },
    { id: 'expenses', label: t.workerExpensesTab || 'مصروفات الفرع اليومية', icon: Wallet },
    { id: 'debts', label: t.workerDebtsTab || 'الديون والتحصيل', icon: CheckSquare, badge: (debts[currentUser?.shopId] || []).length }
  ];

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-10" dir={t.dir || 'rtl'}>
      {renderToastComponent()}
      {renderConfirmModal()}

      {/* ================= 🚪 شاشة تسجيل الدخول واستعادة كلمة المرور ================= */}
      {!currentUser && (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans relative" dir={t.dir || 'rtl'}>
          <div className="absolute top-4 end-4 z-20">
            <div className="flex gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-md">
              <button onClick={() => handleLanguageChange('ar')} className={`px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${lang === 'ar' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>🇸🇦</button>
              <button onClick={() => handleLanguageChange('tr')} className={`px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${lang === 'tr' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>🇹🇷</button>
              <button onClick={() => handleLanguageChange('en')} className={`px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${lang === 'en' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>🇺🇸</button>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl max-w-md w-full space-y-6 border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 text-white p-4 rounded-3xl w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/25">
              {isForgotPasswordView ? <KeyRound size={36} /> : <Car size={36} />}
            </div>

            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {isForgotPasswordView ? (t.forgotPassword || 'استعادة كلمة المرور') : (t.loginTitle || 'تسجيل الدخول')}
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                {isForgotPasswordView 
                  ? 'أدخل بريدك المسجل وسيتم إرسال رابط رسمي إلى Gmail لتغيير كلمة المرور' 
                  : (t.loginSubtitle || 'نظام إدارة مغاسل السيارات السحابي الآمن')}
              </p>
            </div>

            {isForgotPasswordView ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t.email || 'البريد الإلكتروني (Gmail)'}</label>
                  <input 
                    type="email" 
                    placeholder="example@gmail.com"
                    value={inputEmail} 
                    onChange={e => setInputEmail(e.target.value)} 
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-base text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition" 
                    required 
                  />
                </div>

                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-2xl font-bold text-sm cursor-pointer shadow-lg shadow-blue-500/25 active:scale-95 transition">
                  {t.sendResetLink || 'إرسال رابط الاستعادة إلى البريد'}
                </button>

                <button 
                  type="button" 
                  onClick={() => setIsForgotPasswordView(false)} 
                  className="w-full text-slate-600 hover:text-slate-900 py-2 text-xs font-bold transition cursor-pointer"
                >
                  {t.backToLogin || 'العودة لتسجيل الدخول'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleFirebaseLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t.email || 'البريد الإلكتروني'}</label>
                  <input 
                    type="email" 
                    placeholder="name@domain.com"
                    value={inputEmail} 
                    onChange={e => setInputEmail(e.target.value)} 
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-base text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition" 
                    required 
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-slate-700">{t.password || 'كلمة المرور'}</label>
                    <button 
                      type="button" 
                      onClick={() => setIsForgotPasswordView(true)} 
                      className="text-xs text-blue-600 hover:text-blue-700 font-bold cursor-pointer"
                    >
                      {t.forgotPassword || 'نسيت كلمة المرور؟'}
                    </button>
                  </div>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={inputPassword} 
                    onChange={e => setInputPassword(e.target.value)} 
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-base text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition" 
                    required 
                  />
                </div>

                {isResendVerificationAvailable && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs space-y-2">
                    <p className="text-amber-800 font-semibold">{t.emailNotVerifiedMsg || 'لم تقم بتأكيد بريدك الإلكتروني بعد'}</p>
                    <button 
                      type="button" 
                      onClick={handleResendVerification} 
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-xl font-bold cursor-pointer transition shadow-xs"
                    >
                      {t.resendVerificationBtn || 'إعادة إرسال رابط التأكيد'}
                    </button>
                  </div>
                )}

                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-2xl font-bold text-sm cursor-pointer shadow-lg shadow-blue-500/25 active:scale-95 transition">
                  {t.loginBtn || 'دخول'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ================= 🛡️ واجهة المدير العام (السوبر أدمن - موبايل + شريط جانبي) ================= */}
      {currentUser && currentUser.role === 'programmer' && (
        <div className="min-h-screen bg-slate-100 font-sans pb-10" dir={t.dir || 'rtl'}>
          {renderMobileSidebarDrawer(
            programmerMenuItems,
            programmerTab,
            (id) => { setProgrammerTab(id); setSelectedClientEmail(null); },
            t.programmerTitle || 'لوحة الإدارة العامة',
            t.programmerSubtitle || 'لوحة المدير العام • السوبر أدمن',
            false
          )}

          {renderMobileTopBar(
            t.programmerTitle || 'لوحة الإدارة العامة',
            t.fullControlBadge || 'تحكم كامل',
            programmerMenuItems.find(i => i.id === programmerTab)?.label || '',
            `👥 ${activeClientsList.length}`
          )}

          <main className="max-w-lg mx-auto px-3.5 pt-4 space-y-4">
            {/* إحصائيات عامة للمبرمج */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-500">{t.activeClientsStat || 'العملاء النشطون'}</span>
                  <p className="text-xl font-black text-slate-900 mt-0.5">{activeClientsList.length}</p>
                </div>
                <div className="p-3 rounded-2xl bg-blue-50 text-blue-600"><Users size={20} /></div>
              </div>
              <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-500">{t.totalShopsStat || 'إجمالي الفروع'}</span>
                  <p className="text-xl font-black text-slate-900 mt-0.5">{shops.filter(s => !s.isProfileOnly).length}</p>
                </div>
                <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600"><Building size={20} /></div>
              </div>
              <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-500">{t.activeShopsStat || 'الفروع النشطة'}</span>
                  <p className="text-xl font-black text-emerald-600 mt-0.5">{shops.filter(s => !s.isProfileOnly && s.status !== 'suspended').length}</p>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600"><CheckCircle size={20} /></div>
              </div>
              <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-500">{t.suspendedClientsTab || 'الحسابات المعلقة'}</span>
                  <p className="text-xl font-black text-amber-600 mt-0.5">{suspendedClientsList.length}</p>
                </div>
                <div className="p-3 rounded-2xl bg-amber-50 text-amber-600"><AlertTriangle size={20} /></div>
              </div>
            </div>

            {/* تفاصيل عميل محدد عند الضغط على عرض الملف الكامل */}
            {selectedClientEmail ? (() => {
              const clientObj = allClientsList.find(c => c.ownerEmail.toLowerCase() === selectedClientEmail.toLowerCase());
              if (!clientObj) return null;
              return (
                <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                        {t.clientCommercialFile || 'الملف التجاري للعميل'}
                      </span>
                      <h2 className="text-base font-black text-slate-900 mt-1">{clientObj.ownerName}</h2>
                      <p className="text-xs text-slate-500">{clientObj.ownerEmail}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {t.taxNumberLabel || 'الرقم الضريبي:'} {clientObj.taxNumber} | <span dir="ltr">{clientObj.phone}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedClientEmail(null)}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
                    >
                      {t.back || 'رجوع'}
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setEditingClientData({
                        ownerEmail: clientObj.ownerEmail,
                        ownerName: clientObj.ownerName,
                        phone: clientObj.phone,
                        taxNumber: clientObj.taxNumber,
                        ownerPass: clientObj.ownerPass
                      })}
                      className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-blue-50 text-blue-700 text-[11px] font-bold cursor-pointer"
                    >
                      <Edit3 size={13} /> {t.edit || 'تعديل'}
                    </button>
                    <button
                      onClick={() => handleSuspendClientForMonths(clientObj.ownerEmail)}
                      className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-amber-50 text-amber-700 text-[11px] font-bold cursor-pointer"
                    >
                      <AlertTriangle size={13} /> {t.suspendGracePeriod || 'تجميد'}
                    </button>
                    <button
                      onClick={() => handleDeleteClientCompletely(clientObj.ownerEmail)}
                      className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-red-50 text-red-700 text-[11px] font-bold cursor-pointer"
                    >
                      <Trash2 size={13} /> {t.delete || 'حذف'}
                    </button>
                  </div>

                  {editingClientData && (
                    <form onSubmit={handleSaveClientEdits} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
                      <input
                        type="text"
                        value={editingClientData.ownerName}
                        onChange={e => setEditingClientData({ ...editingClientData, ownerName: e.target.value })}
                        placeholder={t.clientFullName}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                        required
                      />
                      <input
                        type="text"
                        value={editingClientData.phone}
                        onChange={e => handlePhoneInputChange(e, (val) => setEditingClientData({ ...editingClientData, phone: val }))}
                        placeholder={t.clientPhone + ' (11 رقم)'}
                        maxLength={11}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                      />
                      <input
                        type="text"
                        value={editingClientData.taxNumber}
                        onChange={e => setEditingClientData({ ...editingClientData, taxNumber: e.target.value })}
                        placeholder={t.clientTax}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                      />
                      <div className="flex gap-2">
                        <button type="submit" className="flex-1 bg-blue-600 text-white rounded-xl text-xs font-bold py-2 cursor-pointer">{t.save || 'حفظ'}</button>
                        <button type="button" onClick={() => setEditingClientData(null)} className="px-3 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer">{t.cancel || 'إلغاء'}</button>
                      </div>
                    </form>
                  )}

                  {/* إدارة اشتراك العميل */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
                    <h3 className="font-black text-xs text-slate-900">{t.manageClientSubsHeading || 'منح وتحديد باقة اشتراك لهذا العميل'}</h3>
                    <p className="text-[11px] text-slate-600">
                      {t.currentPackageLabel || 'الباقة الحالية:'} <strong className="text-blue-700">{clientObj.subscriptionType}</strong> ({clientObj.subscriptionExpiry})
                    </p>
                    <div className="space-y-1.5">
                      {pricingPlans.map(plan => (
                        <button
                          key={plan.id}
                          onClick={() => handleUpdateClientSubscription(clientObj.ownerEmail, plan)}
                          className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer transition"
                        >
                          {(t.grantPlanBtnCustom || 'منح "{name}" ({max} فرع - {days} يوم)')
                            .replace('{name}', plan.name)
                            .replace('{max}', plan.maxShops)
                            .replace('{days}', plan.durationDays)}
                        </button>
                      ))}
                      <button
                        onClick={() => handleRemoveClientSubscription(clientObj.ownerEmail)}
                        className="w-full py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer transition"
                      >
                        {t.cancelSubBtn || 'إلغاء الاشتراك'}
                      </button>
                    </div>
                  </div>

                  {/* الفروع التابعة للعميل */}
                  <div className="space-y-2.5">
                    <h3 className="font-black text-xs text-slate-900">
                      {t.registeredBranchesOfClient || 'الفروع المسجلة لهذا العميل'} ({clientObj.realBranches.length} / {clientObj.maxAllowedShops})
                    </h3>
                    {clientObj.realBranches.length === 0 ? (
                      <p className="text-xs text-slate-500 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                        {t.noBranchesCreatedYet}
                      </p>
                    ) : (
                      <div className="space-y-2.5">
                        {clientObj.realBranches.map(branch => (
                          <div key={branch.id} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2.5">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-black text-slate-900 text-xs">🏪 {branch.name}</h4>
                                <p className="text-[11px] text-slate-500">{branch.workerEmail}</p>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${branch.status === 'suspended' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                {branch.status === 'suspended' ? (t.suspendedStatus || 'معلق') : (t.activeStatus || 'نشط')}
                              </span>
                            </div>
                            <div className="flex gap-2 pt-2 border-t border-slate-200/80">
                              {branch.status === 'suspended' ? (
                                <button onClick={() => handleActivateShop(branch.id)} className="flex-1 py-1.5 rounded-xl bg-emerald-600 text-white text-[11px] font-bold cursor-pointer">
                                  {t.activateShop}
                                </button>
                              ) : (
                                <button onClick={() => handleSuspendShop(branch.id)} className="flex-1 py-1.5 rounded-xl bg-amber-600 text-white text-[11px] font-bold cursor-pointer">
                                  {t.stopShop}
                                </button>
                              )}
                              <button
                                onClick={() => setCurrentUser({
                                  email: branch.workerEmail,
                                  role: 'worker',
                                  shopId: branch.id,
                                  shopName: branch.name,
                                  shopInfo: branch
                                })}
                                className="flex-1 py-1.5 rounded-xl bg-slate-900 text-white text-[11px] font-bold cursor-pointer"
                              >
                                {t.enterBranchAsWorker}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })() : (
              <>
                {programmerTab === 'clients' && (
                  <div className="space-y-4">
                    <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3">
                      <h2 className="font-black text-sm text-slate-900 flex items-center gap-2">
                        <Award size={16} className="text-amber-500" /> {t.vipClientsTitle}
                      </h2>
                      {vipClientsList.length === 0 ? (
                        <p className="text-xs text-slate-400">{t.noVipClients}</p>
                      ) : (
                        <div className="space-y-2.5">
                          {vipClientsList.map(client => (
                            <div key={client.ownerEmail} className="p-3.5 rounded-2xl border-2 border-amber-200 bg-amber-50/30 space-y-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-black text-slate-900 text-xs">{client.ownerName}</h3>
                                  <p className="text-[11px] text-slate-500">{client.ownerEmail}</p>
                                </div>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">VIP • {client.realBranches.length}</span>
                              </div>
                              <button onClick={() => setSelectedClientEmail(client.ownerEmail)} className="w-full py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer">
                                {t.viewFullFile}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3">
                      <h2 className="font-black text-sm text-slate-900 flex items-center gap-2">
                        <Users size={16} className="text-blue-600" /> {t.regularClientsTitle}
                      </h2>
                      {regularClientsList.length === 0 ? (
                        <p className="text-xs text-slate-400">{t.noRegularClients}</p>
                      ) : (
                        <div className="space-y-2.5">
                          {regularClientsList.map(client => (
                            <div key={client.ownerEmail} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-black text-slate-900 text-xs">{client.ownerName}</h3>
                                  <p className="text-[11px] text-slate-500">{client.ownerEmail}</p>
                                </div>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                                  {client.realBranches.length} / {client.maxAllowedShops}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600">{client.subscriptionType} • {client.subscriptionExpiry}</p>
                              <button onClick={() => setSelectedClientEmail(client.ownerEmail)} className="w-full py-2 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer">
                                {t.viewFullFile}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {programmerTab === 'suspended' && (
                  <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3">
                    <h2 className="font-black text-sm text-slate-900">{t.suspendedArchiveTitle}</h2>
                    {suspendedClientsList.length === 0 ? (
                      <p className="text-xs text-slate-400">{t.noSuspendedClients}</p>
                    ) : (
                      <div className="space-y-2.5">
                        {suspendedClientsList.map(client => (
                          <div key={client.ownerEmail} className="p-3.5 rounded-2xl border border-red-200 bg-red-50/30 space-y-2">
                            <div className="flex justify-between items-center">
                              <h3 className="font-black text-slate-900 text-xs">{client.ownerName}</h3>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">{t.suspendedBadge}</span>
                            </div>
                            <p className="text-[11px] text-slate-500">{client.ownerEmail}</p>
                            <button onClick={() => setSelectedClientEmail(client.ownerEmail)} className="w-full py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer">
                              {t.manageAndActivate}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {programmerTab === 'addClient' && (
                  <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-4">
                    <div>
                      <h2 className="font-black text-sm text-slate-900">{t.addNewClientTitle}</h2>
                      <p className="text-[11px] text-slate-500 mt-0.5">{t.addNewClientSubtitle}</p>
                    </div>
                    <form onSubmit={handleProgrammerAddClient} className="space-y-3">
                      <input type="text" placeholder={t.clientFullName} value={newClientName} onChange={e => setNewClientName(e.target.value)} className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs bg-slate-50" required />
                      <input type="email" placeholder={t.clientEmail} value={newClientEmail} onChange={e => setNewClientEmail(e.target.value)} className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs bg-slate-50" required />
                      <input type="text" placeholder={t.clientOwnerPass} value={newClientOwnerPass} onChange={e => setNewClientOwnerPass(e.target.value)} className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs bg-slate-50" required />
                      <input type="text" placeholder={t.clientPhone + ' (11 رقم)'} value={newClientPhone} onChange={e => handlePhoneInputChange(e, setNewClientPhone)} maxLength={11} className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs bg-slate-50" />
                      <input type="text" placeholder={t.clientTax} value={newClientTax} onChange={e => setNewClientTax(e.target.value)} className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs bg-slate-50" />
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">{t.trialPlanChoiceTitle}</label>
                        <button type="button" onClick={() => setSelectedTrialOption('1')} className={`w-full p-3 rounded-2xl border text-xs font-bold text-start cursor-pointer ${selectedTrialOption === '1' ? 'border-blue-600 bg-blue-50 text-blue-800' : 'border-slate-200 bg-white text-slate-700'}`}>
                          {t.trialPlan1Branch}
                        </button>
                        <button type="button" onClick={() => setSelectedTrialOption('2')} className={`w-full p-3 rounded-2xl border text-xs font-bold text-start cursor-pointer ${selectedTrialOption === '2' ? 'border-blue-600 bg-blue-50 text-blue-800' : 'border-slate-200 bg-white text-slate-700'}`}>
                          {t.trialPlan2Branches}
                        </button>
                      </div>
                      <button type="submit" className="w-full py-3 rounded-2xl bg-blue-600 text-white text-xs font-bold cursor-pointer">
                        {t.registerClientBtn}
                      </button>
                    </form>
                  </div>
                )}

                {programmerTab === 'plans' && (
                  <div className="space-y-4">
                    <form onSubmit={handleAddPricingPlan} className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                      <h3 className="font-black text-sm text-slate-900">{t.addNewPlanTitle}</h3>
                      <input type="text" placeholder={t.planName} value={newPlanName} onChange={e => setNewPlanName(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs" required />
                      <input type="number" placeholder={t.planPrice} value={newPlanPrice} onChange={e => setNewPlanPrice(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs" required />
                      <input type="number" placeholder={t.planMaxShops} value={newPlanMaxShops} onChange={e => setNewPlanMaxShops(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs" required />
                      <input type="number" placeholder={t.planDays} value={newPlanDays} onChange={e => setNewPlanDays(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs" required />
                      <button type="submit" className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer">{t.addNewPlanBtn}</button>
                    </form>

                    <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                      <h3 className="font-black text-sm text-slate-900">{t.currentPlansTitle}</h3>
                      {pricingPlans.map(plan => (
                        <div key={plan.id} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2">
                          {editingPlanId === plan.id ? (
                            <div className="space-y-2">
                              <input type="text" value={editPlanName} onChange={e => setEditPlanName(e.target.value)} className="w-full px-3 py-1.5 rounded-lg border text-xs bg-white" />
                              <input type="number" value={editPlanPrice} onChange={e => setEditPlanPrice(e.target.value)} className="w-full px-3 py-1.5 rounded-lg border text-xs bg-white" />
                              <input type="number" value={editPlanMaxShops} onChange={e => setEditPlanMaxShops(e.target.value)} className="w-full px-3 py-1.5 rounded-lg border text-xs bg-white" />
                              <input type="number" value={editPlanDays} onChange={e => setEditPlanDays(e.target.value)} className="w-full px-3 py-1.5 rounded-lg border text-xs bg-white" />
                              <div className="flex gap-2">
                                <button onClick={() => handleSaveEditPlan(plan.id)} className="flex-1 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold cursor-pointer">{t.save}</button>
                                <button onClick={() => setEditingPlanId(null)} className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer">{t.cancel}</button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <h4 className="font-black text-slate-900 text-xs">{plan.name}</h4>
                              <p className="text-base font-black text-blue-600">{plan.price} {t.currency}</p>
                              <p className="text-[11px] text-slate-500">{t.maxShopsAllowed} {plan.maxShops} | {plan.durationDays} يوم</p>
                              <div className="flex gap-2 pt-1">
                                <button onClick={() => handleStartEditPlan(plan)} className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold cursor-pointer">{t.edit}</button>
                                <button onClick={() => handleDeletePricingPlan(plan.id)} className="px-3 py-1 rounded-lg bg-red-50 text-red-700 text-xs font-bold cursor-pointer">{t.delete}</button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {programmerTab === 'discounts' && (
                  <div className="space-y-4">
                    <form onSubmit={handleApplyDirectDiscountToClient} className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                      <h3 className="font-black text-sm text-slate-900">{t.applyDiscountHeading}</h3>
                      <select value={targetClientEmailForDiscount} onChange={e => setTargetClientEmailForDiscount(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50" required>
                        <option value="">{t.selectClientOption}</option>
                        {allClientsList.map(c => (
                          <option key={c.ownerEmail} value={c.ownerEmail}>{c.ownerName} ({c.ownerEmail})</option>
                        ))}
                      </select>
                      <input type="number" min="1" max="100" placeholder={t.discountPercentPlaceholder} value={directDiscountValue} onChange={e => setDirectDiscountValue(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs" required />
                      <button type="submit" className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer">{t.applyDiscountBtn}</button>
                    </form>

                    <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                      <h3 className="font-black text-sm text-slate-900">{t.clientsWithDiscountsTitle}</h3>
                      {allClientsList.filter(c => Number(c.discountPercent) > 0).map(c => (
                        <div key={c.ownerEmail} className="p-3.5 rounded-2xl border border-slate-200 flex justify-between items-center">
                          <div>
                            <h4 className="font-bold text-xs text-slate-900">{c.ownerName}</h4>
                            <p className="text-[11px] text-emerald-600 font-bold">%{c.discountPercent}</p>
                          </div>
                          <button onClick={() => handleRemoveDiscountFromClient(c.ownerEmail)} className="px-3 py-1 rounded-xl bg-red-50 text-red-700 text-xs font-bold cursor-pointer">
                            {t.cancelDiscount}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ================= قسم تقارير العملاء ومبيعات الاشتراكات الشامل والمحدث (للمبرمج) ================= */}
                {programmerTab === 'report' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-5 rounded-3xl shadow-xl space-y-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2.5 rounded-2xl bg-white/15">
                          <BarChart3 size={22} />
                        </div>
                        <div>
                          <h3 className="text-base font-black">{t.programmerRevenueReportTitle || 'تقرير مبيعات الاشتراكات وأرباح المنصة'}</h3>
                          <p className="text-xs text-blue-100 mt-0.5">{t.programmerRevenueReportSub || 'إحصائيات شاملة لدخل المنصة وأعداد الاشتراكات النشطة'}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="bg-white/10 p-3.5 rounded-2xl border border-white/20">
                          <span className="text-[11px] text-blue-200 font-bold block">{t.totalPlatformRevenueLabel || 'إجمالي إيرادات الاشتراكات المحققة'}</span>
                          <p className="text-xl font-black mt-1">{totalPlatformRevenue} <span className="text-xs font-normal">{t.currency}</span></p>
                        </div>
                        <div className="bg-white/10 p-3.5 rounded-2xl border border-white/20">
                          <span className="text-[11px] text-blue-200 font-bold block">{t.activeSubscriptionsCount || 'الاشتراكات النشطة'}</span>
                          <p className="text-xl font-black mt-1">{activeClientsList.length} <span className="text-xs font-normal">{t.clientSubscriber || 'عميل'}</span></p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                        <h3 className="font-black text-sm text-slate-900">{t.subsStatementTitle || 'كشف عملاء واشتراكات المنصة بالكامل'}</h3>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-xl">
                          {allClientsList.length} {t.clientSubscriber || 'عميل'}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {allClientsList.map(c => (
                          <div key={c.ownerEmail} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2 text-xs">
                            <div className="flex justify-between items-center">
                              <span className="font-black text-slate-900 text-sm">👤 {c.ownerName}</span>
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${c.status === 'suspended' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                {c.status === 'suspended' ? (t.suspendedStatus || 'معلق') : (t.activeStatus || 'نشط')}
                              </span>
                            </div>
                            <p className="text-slate-500">{c.ownerEmail} | <span dir="ltr">{c.phone}</span></p>
                            
                            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/80 text-[11px]">
                              <div>
                                <span className="text-slate-500 block">{t.planTypeCol || 'الباقة:'}</span>
                                <strong className="text-blue-700">{c.subscriptionType}</strong>
                              </div>
                              <div>
                                <span className="text-slate-500 block">{t.planPrice || 'قيمة الباقة:'}</span>
                                <strong className="text-emerald-700">{c.status !== 'suspended' ? c.planPrice : 0} {t.currency}</strong>
                              </div>
                              <div>
                                <span className="text-slate-500 block">{t.activeBranchesCol || 'الفروع النشطة:'}</span>
                                <strong className="text-slate-900">{c.realBranches.length} / {c.maxAllowedShops}</strong>
                              </div>
                              <div>
                                <span className="text-slate-500 block">{t.subExpiryCol || 'تاريخ الانتهاء:'}</span>
                                <strong className="text-slate-800">{c.subscriptionExpiry}</strong>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      )}

      {/* ================= 👔 واجهة صاحب المغسلة (تطبيق موبايل + شريط جانبي كامل) ================= */}
      {currentUser && currentUser.role === 'owner' && (
        <div className="min-h-screen bg-slate-100 font-sans pb-12" dir={t.dir || 'rtl'}>
          {renderMobileSidebarDrawer(
            ownerMenuItems,
            activeTab,
            (id) => setActiveTab(id),
            currentUser.ownerName || (t.ownerDashboard || 'لوحة الإدارة'),
            t.ownerSubtitle || 'مالك مغسلة',
            true
          )}

          {renderMobileTopBar(
            currentUser.ownerName || (t.ownerDashboard || 'لوحة الإدارة'),
            isAllShops ? (t.combinedAllShopsTitle || 'جميع الفروع') : (currentShop?.name || ''),
            ownerMenuItems.find(i => i.id === activeTab)?.label || '',
            `🏪 ${realOwnedShops.length}/${masterOwnerAccount.maxAllowedShops || 1}`
          )}

          <main className="max-w-lg mx-auto px-3.5 pt-4 space-y-4">
            {/* شريط سريع لاختيار الفرع في أعلى شاشة الموبايل */}
            {realOwnedShops.length > 0 && (
              <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5 shrink-0">
                  <Building size={15} className="text-blue-600" />
                  {t.selectedBranchLabel || 'الفرع المعروض'}:
                </span>
                <select
                  value={selectedShopId}
                  onChange={e => setSelectedShopId(e.target.value === 'all' ? 'all' : (Number(e.target.value) || e.target.value))}
                  className="bg-slate-100 text-slate-900 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 outline-none cursor-pointer flex-1"
                >
                  <option value="all">
                    📊 {(t.combinedReportOption || 'تقرير شامل ({count} فروع)').replace('{count}', realOwnedShops.length)}
                  </option>
                  {realOwnedShops.map(shop => (
                    <option key={shop.id} value={shop.id}>🏪 {shop.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* ================= 1. تبويب نظرة عامة والمالية ================= */}
            {activeTab === 'dashboard' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 rounded-3xl shadow-lg shadow-emerald-600/20 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-emerald-100 block">{t.totalNetProfit || 'صافي الأرباح'}</span>
                      <p className="text-2xl font-black mt-0.5">{ownerNetProfit} <span className="text-xs font-normal">{t.currency}</span></p>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/15"><TrendingUp size={24} /></div>
                  </div>
                  <div className="bg-white p-3.5 rounded-3xl border border-slate-200/80 shadow-xs">
                    <span className="text-[11px] font-bold text-slate-500 block">{t.cashBox || 'صندوق الكاش'}</span>
                    <p className="text-lg font-black text-slate-900 mt-1">{ownerCashCollected} <span className="text-[11px] font-normal text-slate-500">{t.currency}</span></p>
                  </div>
                  <div className="bg-white p-3.5 rounded-3xl border border-slate-200/80 shadow-xs">
                    <span className="text-[11px] font-bold text-slate-500 block">{t.bankAccount || 'البنك'}</span>
                    <p className="text-lg font-black text-blue-600 mt-1">{ownerBankCollected} <span className="text-[11px] font-normal text-slate-500">{t.currency}</span></p>
                  </div>
                  <div className="bg-white p-3.5 rounded-3xl border border-slate-200/80 shadow-xs">
                    <span className="text-[11px] font-bold text-slate-500 block">{t.totalPendingDebts || 'الديون المعلقة'}</span>
                    <p className="text-lg font-black text-amber-600 mt-1">{ownerTotalPendingDebts} <span className="text-[11px] font-normal text-slate-500">{t.currency}</span></p>
                  </div>
                  <div className="bg-white p-3.5 rounded-3xl border border-slate-200/80 shadow-xs">
                    <span className="text-[11px] font-bold text-slate-500 block">{t.totalExpensesStat || 'إجمالي المصروفات'}</span>
                    <p className="text-lg font-black text-red-600 mt-1">{ownerTotalExpenses} <span className="text-[11px] font-normal text-slate-500">{t.currency}</span></p>
                  </div>
                </div>

                {/* تعميم إلى عمال الفرع */}
                <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center gap-2">
                    <Bell size={17} className="text-amber-500" />
                    <h3 className="font-black text-sm text-slate-900">{t.workerAnnouncementsTitle || 'تعميم إلى عمال الفرع'}</h3>
                  </div>
                  <form onSubmit={handleAddAnnouncement} className="space-y-2.5">
                    <input
                      type="text"
                      placeholder={t.alertTitlePlaceholder || 'عنوان التعميم'}
                      value={ownerNoticeTitle}
                      onChange={e => setOwnerNoticeTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 outline-none"
                    />
                    <textarea
                      rows={2}
                      placeholder={t.alertTextPlaceholder || 'نص التنبيه أو التعميم...'}
                      value={ownerNoticeText}
                      onChange={e => setOwnerNoticeText(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 outline-none"
                    />
                    <button type="submit" className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold cursor-pointer transition">
                      {t.publishAlertBtn || 'إرسال ونشر التعميم'}
                    </button>
                  </form>
                  {(announcements[selectedShopId] || []).map(ann => (
                    <div key={ann.id} className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-bold text-xs text-amber-900">{ann.title}</h4>
                        <p className="text-xs text-amber-800">{ann.text}</p>
                      </div>
                      <button onClick={() => handleDeleteAnnouncement(selectedShopId, ann.id)} className="text-red-500 cursor-pointer">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* صرف رواتب وأجور العمال */}
                <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center gap-2">
                    <Banknote size={17} className="text-emerald-600" />
                    <h3 className="font-black text-sm text-slate-900">{t.workerSalariesTitle || 'صرف رواتب وأجور العمال'}</h3>
                  </div>
                  <form onSubmit={handleOwnerPayWorkerSalary} className="space-y-2.5">
                    <select
                      value={salaryWorkerShopId}
                      onChange={e => setSalaryWorkerShopId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50"
                      required
                    >
                      <option value="">{t.workerSelectLabel}</option>
                      {realOwnedShops.map(sh => (
                        <option key={sh.id} value={sh.id}>🏪 {sh.name} ({sh.workerEmail})</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder={t.salaryAmount}
                      value={salaryAmount}
                      onChange={e => setSalaryAmount(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50"
                      required
                    />
                    <input
                      type="text"
                      placeholder={t.notesOptional}
                      value={salaryNotes}
                      onChange={e => setSalaryNotes(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50"
                    />
                    <button type="submit" className="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer">
                      {t.paySalaryBtn}
                    </button>
                  </form>
                </div>

                {/* سجل حركة السيارات */}
                <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                  <h3 className="font-black text-sm text-slate-900">
                    🚗 {t.carMovementLog} ({ownerFilteredTransactions.length})
                  </h3>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder={t.searchPlatePlaceholder}
                      value={plateSearchQuery}
                      onChange={e => setPlateSearchQuery(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50"
                    />
                    <div className="flex gap-1.5">
                      <input
                        type="date"
                        value={selectedDateFilter}
                        onChange={e => setSelectedDateFilter(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50"
                      />
                      <button onClick={() => setSelectedDateFilter(new Date().toISOString().slice(0, 10))} className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold cursor-pointer">
                        {t.today}
                      </button>
                      <button onClick={() => setSelectedDateFilter('')} className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer">
                        {t.allRecords}
                      </button>
                    </div>
                  </div>

                  {ownerFilteredTransactions.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">{t.noCarsRegisteredDate}</p>
                  ) : (
                    <div className="space-y-2.5">
                      {ownerFilteredTransactions.map(tx => (
                        <div key={tx.id} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-black text-xs text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200" dir="ltr">{tx.plate}</span>
                            <span className="font-black text-xs text-emerald-700">{tx.price} {t.currency}</span>
                          </div>
                          <p className="text-xs font-bold text-slate-800">{translateVehicleCategory(tx.vehicleCategory)} {tx.carModel ? `• ${tx.carModel}` : ''}</p>
                          <p className="text-[11px] text-slate-500">{translateServiceType(tx.service)} • {translatePaymentMethod(tx.method)} • {tx.date}</p>
                          <div className="flex gap-2 pt-2 border-t border-slate-200/80">
                            <button onClick={() => setSelectedInvoice(tx)} className="flex-1 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer flex items-center justify-center gap-1">
                              <Printer size={13} /> {t.printInvoiceBtn}
                            </button>
                            <button onClick={() => handleShareWhatsApp(tx)} className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer">
                              <Share2 size={13} />
                            </button>
                            <button onClick={() => handleDeleteTransactionByOwner(tx.shopId, tx.id)} className="px-2.5 py-1.5 rounded-xl bg-red-50 text-red-600 text-xs font-bold cursor-pointer">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ================= 2. تبويب إدارة الفروع ================= */}
            {activeTab === 'addShop' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <form onSubmit={handleOwnerSaveShop} className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-black text-sm text-slate-900">
                      {editingShopId ? t.editShopTitle : t.addNewShopTitle}
                    </h3>
                    {editingShopId && (
                      <button type="button" onClick={() => { setEditingShopId(null); setNewShopName(''); setNewWorkerEmail(''); setNewWorkerPass(''); }} className="text-xs text-red-600 font-bold cursor-pointer">
                        {t.cancelEdit}
                      </button>
                    )}
                  </div>
                  <input type="text" placeholder={t.shopNamePlaceholder} value={newShopName} onChange={e => setNewShopName(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50" required />
                  <input type="email" placeholder={t.workerEmailLabel} value={newWorkerEmail} onChange={e => setNewWorkerEmail(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50" required />
                  <input type="text" placeholder={t.workerPassLabel} value={newWorkerPass} onChange={e => setNewWorkerPass(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50" required />
                  <input type="text" placeholder={t.shopPhoneLabel + ' (11 رقم)'} value={newShopPhone} onChange={e => handlePhoneInputChange(e, setNewShopPhone)} maxLength={11} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50" />
                  <input type="text" placeholder={t.shopAddressPlaceholder} value={newShopAddress} onChange={e => setNewShopAddress(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50" />
                  <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer">
                    {editingShopId ? t.saveShopEditBtn : t.addNewShopBtn}
                  </button>
                </form>

                <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                  <h3 className="font-black text-sm text-slate-900">{t.registeredBranchesTitle} ({realOwnedShops.length}/{masterOwnerAccount.maxAllowedShops || 1})</h3>
                  {realOwnedShops.map(shop => (
                    <div key={shop.id} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-black text-slate-900 text-xs">🏪 {shop.name}</h4>
                          <p className="text-[11px] text-slate-500">{shop.workerEmail}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${shop.status === 'suspended' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {shop.status === 'suspended' ? t.suspendedStatus : t.activeStatus}
                        </span>
                      </div>
                      <div className="flex gap-2 pt-2 border-t border-slate-200/80">
                        <button onClick={() => handleStartEditShop(shop)} className="flex-1 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold cursor-pointer">{t.edit}</button>
                        <button onClick={() => handleDeleteShopByOwner(shop.id)} className="flex-1 py-1.5 rounded-xl bg-red-50 text-red-700 text-xs font-bold cursor-pointer">{t.delete}</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ================= 3. تبويب كشف الحسابات ================= */}
            {activeTab === 'accounting' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-black text-sm text-slate-900">{t.financialStatementTitle}</h3>
                    <button onClick={handlePrintComprehensiveReport} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer">
                      <Printer size={14} /> {t.printFinancialPdf}
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-bold block">{t.totalCollected}</span>
                      <p className="text-sm font-black text-slate-900 mt-0.5">{ownerCashCollected + ownerBankCollected}</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-red-50 border border-red-200">
                      <span className="text-[10px] text-red-600 font-bold block">{t.totalExpensesStat}</span>
                      <p className="text-sm font-black text-red-700 mt-0.5">-{ownerTotalExpenses}</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                      <span className="text-[10px] text-emerald-700 font-bold block">{t.netProfitLabel}</span>
                      <p className="text-sm font-black text-emerald-800 mt-0.5">{ownerNetProfit}</p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <h4 className="font-black text-xs text-slate-900">{t.customerDebtsRecord}</h4>
                    {ownerDebtsList.length === 0 ? (
                      <p className="text-xs text-slate-400 bg-slate-50 p-3 rounded-2xl">{t.noDebtsForCurrentShop}</p>
                    ) : (
                      ownerDebtsList.map(d => (
                        <div key={d.id} className="p-3 rounded-2xl border border-amber-200 bg-amber-50/50 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-xs text-slate-900">{d.debtorName}</span>
                            <span className="font-black text-xs text-amber-800">{d.amount} {t.currency}</span>
                          </div>
                          {settlingDebtId === d.id ? (
                            <div className="flex gap-2">
                              <select value={repayMethod} onChange={e => setRepayMethod(e.target.value)} className="px-2 py-1 rounded-lg border text-xs bg-white">
                                <option value="كاش">{t.cash}</option>
                                <option value="بنك">{t.bank}</option>
                              </select>
                              <button onClick={() => handleSettleDebtAction(d.shopId, d)} className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold cursor-pointer">
                                {t.confirmSettle}
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => setSettlingDebtId(d.id)} className="px-3 py-1 rounded-lg bg-amber-600 text-white text-xs font-bold cursor-pointer">
                              {t.settleDebtBtn}
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  <div className="space-y-2.5">
                    <h4 className="font-black text-xs text-slate-900">{t.expensesDetails}</h4>
                    {ownerExpensesList.length === 0 ? (
                      <p className="text-xs text-slate-400 bg-slate-50 p-3 rounded-2xl">{t.noExpensesForShop}</p>
                    ) : (
                      ownerExpensesList.map(exp => (
                        <div key={exp.id} className="p-3 rounded-2xl border border-slate-200 bg-slate-50 flex justify-between items-center">
                          <div>
                            <span className="font-bold text-xs text-slate-900 block">{exp.title}</span>
                            <span className="text-[10px] text-slate-500">{exp.category} • {exp.date}</span>
                          </div>
                          <span className="font-black text-xs text-red-600">-{exp.amount} {t.currency}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ================= 4. تبويب التقارير المالية والتشغيلية (موبايل احترافي) ================= */}
            {activeTab === 'reports' && currentReportStats && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md">
                      <BarChart3 size={20} />
                    </div>
                    <div>
                      <h2 className="text-sm font-black text-slate-900">
                        {t.reportsTitle || 'تقارير الأداء والمبيعات'}
                      </h2>
                      <p className="text-[11px] text-blue-600 font-bold">{currentReportStats.shopName}</p>
                    </div>
                  </div>

                  {/* فلاتر الفترة الزمنية للموبايل */}
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: 'today', label: t.rangeToday || 'اليوم' },
                      { id: 'week', label: t.rangeThisWeek || '7 أيام' },
                      { id: 'month', label: t.rangeThisMonth || 'الشهر' },
                      { id: 'custom', label: t.rangeCustom || 'مخصص' }
                    ].map(rangeBtn => (
                      <button
                        key={rangeBtn.id}
                        onClick={() => setReportTimeRange(rangeBtn.id)}
                        className={`py-2 px-1 rounded-xl text-[11px] font-bold cursor-pointer transition ${
                          reportTimeRange === rangeBtn.id
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {rangeBtn.label}
                      </button>
                    ))}
                  </div>

                  {reportTimeRange === 'custom' && (
                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">{t.fromDateLabel}</label>
                        <input type="date" value={reportFromDate} onChange={e => setReportFromDate(e.target.value)} className="w-full px-2 py-1.5 rounded-xl border border-slate-200 text-xs bg-white" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">{t.toDateLabel}</label>
                        <input type="date" value={reportToDate} onChange={e => setReportToDate(e.target.value)} className="w-full px-2 py-1.5 rounded-xl border border-slate-200 text-xs bg-white" />
                      </div>
                    </div>
                  )}

                  {/* أزرار الطباعة والمشاركة عبر واتساب */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={handlePrintComprehensiveReport}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-slate-900 text-white text-xs font-bold cursor-pointer active:scale-95 transition"
                    >
                      <Printer size={14} />
                      <span>{t.printReportPdf || 'طباعة PDF'}</span>
                    </button>
                    <button
                      onClick={handleShareReportWhatsApp}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-emerald-600 text-white text-xs font-bold cursor-pointer active:scale-95 transition"
                    >
                      <Share2 size={14} />
                      <span>{t.shareReportWhatsApp || 'مشاركة واتساب'}</span>
                    </button>
                  </div>
                </div>

                {/* بطاقات ملخص الأداء */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 rounded-3xl shadow-md flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-emerald-100">{t.netProfitInPeriod || 'صافي الأرباح'}</span>
                      <p className="text-2xl font-black mt-0.5">{currentReportStats.netProfit} <span className="text-xs font-normal">{t.currency}</span></p>
                    </div>
                    <TrendingUp size={26} />
                  </div>

                  <div className="bg-white p-3.5 rounded-3xl border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-500 block">{t.totalRevenueInPeriod || 'إجمالي المبيعات'}</span>
                    <p className="text-lg font-black text-blue-600 mt-1">{currentReportStats.totalRevenue} <span className="text-[10px]">{t.currency}</span></p>
                  </div>

                  <div className="bg-white p-3.5 rounded-3xl border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-500 block">{t.totalExpensesInPeriod || 'المصاريف والأجور'}</span>
                    <p className="text-lg font-black text-red-600 mt-1">-{currentReportStats.totalExpenses} <span className="text-[10px]">{t.currency}</span></p>
                  </div>

                  <div className="col-span-2 bg-white p-4 rounded-3xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-500 block">{t.totalWashesInPeriod || 'إجمالي الآليات المغسولة'}</span>
                      <span className="text-[11px] text-slate-500 font-semibold">
                        🚗 {t.car}: {currentReportStats.totalCarsCount} | 🏍️ {t.motorcycle}: {currentReportStats.totalBikesCount}
                      </span>
                    </div>
                    <span className="text-2xl font-black text-indigo-600">{currentReportStats.totalWashes}</span>
                  </div>
                </div>

                {/* تفصيل الخدمات الأكثر طلباً */}
                <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                  <h3 className="font-black text-xs sm:text-sm text-slate-900 flex items-center gap-2">
                    <PieChart size={16} className="text-blue-600" />
                    {t.servicesReportHeading || 'تفصيل الخدمات الأكثر طلباً'}
                  </h3>

                  {Object.keys(currentReportStats.servicesMap).length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">{t.noReportData}</p>
                  ) : (
                    <div className="space-y-3">
                      {Object.entries(currentReportStats.servicesMap).map(([srvName, srvData]) => {
                        const pct = currentReportStats.totalRevenue > 0
                          ? Math.min(100, Math.round((srvData.revenue / currentReportStats.totalRevenue) * 100))
                          : 0;
                        return (
                          <div key={srvName} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-black text-slate-900">{srvName}</span>
                              <span className="font-bold text-emerald-700">{srvData.revenue} {t.currency} ({srvData.count})</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                                <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-[11px] font-bold text-slate-600">%{pct}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* تفصيل طرق التحصيل والدفع */}
                <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-2.5">
                  <h3 className="font-black text-xs sm:text-sm text-slate-900 flex items-center gap-2">
                    <Wallet size={16} className="text-emerald-600" />
                    {t.paymentMethodsHeading || 'تفصيل طرق التحصيل والدفع'}
                  </h3>
                  <div className="flex justify-between items-center p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs">
                    <span className="font-bold text-emerald-900">💵 {t.cash}</span>
                    <span className="font-black text-emerald-700">{currentReportStats.cashTotal} {t.currency}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-2xl bg-blue-50 border border-blue-200 text-xs">
                    <span className="font-bold text-blue-900">💳 {t.bank}</span>
                    <span className="font-black text-blue-700">{currentReportStats.bankTotal} {t.currency}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs">
                    <span className="font-bold text-amber-900">📝 {t.debt}</span>
                    <span className="font-black text-amber-700">{currentReportStats.debtTotal} {t.currency}</span>
                  </div>
                </div>
              </div>
            )}

            {/* ================= 5. تبويب بيانات الحساب ================= */}
            {activeTab === 'profile' && (
              <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-4 animate-in fade-in duration-200">
                <h3 className="font-black text-sm text-slate-900">{t.profileAndTaxTitle}</h3>
                <form onSubmit={handleSaveOwnerProfile} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t.ownerOrgName}</label>
                    <input
                      type="text"
                      value={currentUser.ownerName || ''}
                      onChange={e => setCurrentUser({ ...currentUser, ownerName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t.taxNumberOrg}</label>
                    <input
                      type="text"
                      placeholder={t.taxNumberPlaceholder}
                      value={currentUser.taxNumber || ''}
                      onChange={e => setCurrentUser({ ...currentUser, taxNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50"
                    />
                  </div>
                  <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer">
                    {t.saveProfileBtn}
                  </button>
                </form>
              </div>
            )}
          </main>
        </div>
      )}

      {/* ================= 🧽 واجهة عامل الفرع (موبايل + شريط جانبي مع بحث النمرة والخدمات المصححة وخيار "أخرى") ================= */}
      {currentUser && currentUser.role === 'worker' && (
        <div className="min-h-screen bg-slate-100 font-sans pb-12" dir={t.dir || 'rtl'}>
          {renderMobileSidebarDrawer(
            workerMenuItems,
            workerActiveTab,
            (id) => setWorkerActiveTab(id),
            `🏪 ${currentUser.shopName || currentShop?.name || 'الفرع'}`,
            t.workerSubtitle || 'عامل الفرع المعتمد',
            false
          )}

          {renderMobileTopBar(
            `🏪 ${currentUser.shopName || currentShop?.name || 'الفرع'}`,
            t.workerSubtitle || 'عامل الفرع المعتمد',
            workerMenuItems.find(i => i.id === workerActiveTab)?.label || '',
            `🚗 ${(transactions[currentUser.shopId] || []).length}`
          )}

          <main className="max-w-lg mx-auto px-3.5 pt-4 space-y-4">
            {(announcements[currentUser.shopId] || []).length > 0 && (
              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl space-y-1.5">
                {announcements[currentUser.shopId].map(ann => (
                  <div key={ann.id} className="flex items-start gap-2 text-xs text-amber-900">
                    <Bell size={15} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>{ann.title}: </strong>
                      <span>{ann.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {workerActiveTab === 'washes' && (
              <div className="space-y-4">
                <form onSubmit={handleAddTransaction} className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3.5">
                  <h3 className="font-black text-sm text-slate-900">
                    {editingTxId ? t.editVehicleInfo : t.registerNewWash}
                  </h3>

                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setVehicleCategory('سيارة')} className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border ${vehicleCategory === 'سيارة' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                      <Car size={15} /> {t.car}
                    </button>
                    <button type="button" onClick={() => setVehicleCategory('موتور')} className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border ${vehicleCategory === 'موتور' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                      <Bike size={15} /> {t.motorcycle}
                    </button>
                  </div>

                  {vehicleCategory === 'سيارة' && (
                    <select value={carModel} onChange={e => setCarModel(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50">
                      <option value="">{t.selectCarModel}</option>
                      {carBrandsLibrary.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  )}

                  <input type="text" placeholder={t.plateNumber} value={plateNumber} onChange={e => setPlateNumber(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 font-bold uppercase" required />

                  {/* قائمة الخدمات المصححة لغوياً واحترافياً مع خيار "أخرى" لكتابة أي خدمة */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-600 block">{t.serviceNameLabel || 'اختر الخدمة:'}</label>
                    <select value={serviceType} onChange={e => setServiceType(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 font-bold" required>
                      <option value="">{t.selectServicePrompt || '-- اختر نوع الخدمة المقدمة للزبون --'}</option>
                      {(t.servicesList || [
                        'غسيل خارجي', 
                        'غسيل داخلي وخارجي', 
                        'غسيل محرك', 
                        'تلميع كامل (كوافير)', 
                        'تلميع نص (نص كوافير)', 
                        'غسيل تحتاني (بصتا جيلا)', 
                        'أخرى'
                      ]).map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>

                    {serviceType === 'أخرى' && (
                      <input 
                        type="text" 
                        placeholder={t.customServicePlaceholder || 'اكتب اسم الخدمة الجديدة التي قدمتها للزبون...'} 
                        value={customServiceName} 
                        onChange={e => setCustomServiceName(e.target.value)} 
                        className="w-full px-3.5 py-2 rounded-xl border border-blue-300 text-xs bg-blue-50/50" 
                        required 
                      />
                    )}
                  </div>

                  <input type="number" placeholder={t.enterPricePlaceholder} value={price} onChange={e => setPrice(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 font-bold" required />

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'كاش', label: t.cash },
                      { id: 'بنك', label: t.bank },
                      { id: 'دين', label: t.debt }
                    ].map(m => (
                      <button key={m.id} type="button" onClick={() => setPayMethod(m.id)} className={`py-2 rounded-xl text-xs font-bold cursor-pointer border ${payMethod === m.id ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                        {m.label}
                      </button>
                    ))}
                  </div>

                  {payMethod === 'دين' && (
                    <div className="space-y-2 p-3 rounded-2xl bg-amber-50 border border-amber-200">
                      <input type="text" placeholder={t.debtorFullName} value={debtorName} onChange={e => setDebtorName(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-amber-300 text-xs bg-white" required />
                      <input type="text" placeholder={t.phoneLabel + ' (11 رقم)'} value={debtorPhone} onChange={e => handlePhoneInputChange(e, setDebtorPhone)} maxLength={11} className="w-full px-3 py-2 rounded-xl border border-amber-300 text-xs bg-white" />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500">{t.startTimePlaceholder}</label>
                      <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50" />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-500">{t.endTimePlaceholder}</label>
                      <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer">
                      <Camera size={15} className="text-blue-600" />
                      <span>{beforePhoto ? `${t.beforeWashPhoto} ✓` : t.beforeWashPhoto}</span>
                      <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'before')} className="hidden" />
                    </label>
                    <label className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer">
                      <ImageIcon size={15} className="text-emerald-600" />
                      <span>{afterPhoto ? `${t.afterWashPhoto} ✓` : t.afterWashPhoto}</span>
                      <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'after')} className="hidden" />
                    </label>
                  </div>

                  <input type="text" placeholder={t.notesPlaceholder} value={txNotes} onChange={e => setTxNotes(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50" />

                  <button type="submit" className="w-full py-3.5 rounded-2xl bg-blue-600 text-white text-xs font-bold cursor-pointer shadow-lg shadow-blue-600/20">
                    {editingTxId ? t.updateInfo : t.saveOrderAndRefresh}
                  </button>
                </form>

                {/* سجل حركة السيارات مع خيار البحث الفوري برقم النمرة للعامل */}
                <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <h3 className="font-black text-sm text-slate-900">{t.carMovementLog}</h3>
                      <input type="date" value={selectedDateFilter} onChange={e => setSelectedDateFilter(e.target.value)} className="px-2.5 py-1 rounded-xl border border-slate-200 text-xs bg-slate-50" />
                    </div>
                    {/* حقل البحث برقم النمرة المخصص للعامل */}
                    <div className="relative">
                      <Search size={15} className="absolute top-3 end-3 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder={t.workerPlateSearchPlaceholder || '🔍 ابحث برقم النمرة (اللوحة)...'} 
                        value={workerSearchPlate} 
                        onChange={e => setWorkerSearchPlate(e.target.value)} 
                        className="w-full px-3.5 py-2.5 pr-9 rounded-xl border border-slate-200 text-xs bg-slate-50 font-bold uppercase outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {(transactions[currentUser.shopId] || [])
                      .filter(item => {
                        const matchesDate = !selectedDateFilter || item.date === selectedDateFilter;
                        const matchesPlate = !workerSearchPlate || (item.plate && item.plate.toLowerCase().includes(workerSearchPlate.trim().toLowerCase()));
                        return matchesDate && matchesPlate;
                      })
                      .map(tx => (
                        <div key={tx.id} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-black text-xs text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg" dir="ltr">{tx.plate}</span>
                            <span className="font-black text-xs text-emerald-700">{tx.price} {t.currency}</span>
                          </div>
                          <p className="text-xs font-bold text-slate-800">{translateVehicleCategory(tx.vehicleCategory)} {tx.carModel ? `(${tx.carModel})` : ''}</p>
                          <p className="text-[11px] text-slate-500">{translateServiceType(tx.service)} • {translatePaymentMethod(tx.method)}</p>
                          <div className="flex gap-2 pt-2 border-t border-slate-200/80">
                            <button onClick={() => handleStartEditTransaction(tx)} className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold cursor-pointer">{t.edit}</button>
                            <button onClick={() => setSelectedInvoice({ ...tx, shopName: currentUser.shopName, shopInfo: currentUser.shopInfo })} className="flex-1 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer">{t.printInvoiceBtn}</button>
                            <button onClick={() => handleShareWhatsApp({ ...tx, shopName: currentUser.shopName, shopInfo: currentUser.shopInfo })} className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer">
                              <Share2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {workerActiveTab === 'expenses' && (
              <div className="space-y-4">
                <form onSubmit={handleAddExpense} className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                  <h3 className="font-black text-sm text-slate-900">{t.recordExpenseFor}</h3>
                  <select value={expCategory} onChange={e => setExpCategory(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50">
                    {(t.expCategories || ['غذاء وضيافة', 'مواد تنظيف', 'فواتير وصيانة', 'أخرى']).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <input type="text" placeholder={t.expTitlePlaceholder} value={expTitle} onChange={e => setExpTitle(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50" required />
                  <input type="number" placeholder={t.expAmountPlaceholder} value={expAmount} onChange={e => setExpAmount(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50" required />
                  <input type="text" placeholder={t.expNotesPlaceholder} value={expNotes} onChange={e => setExpNotes(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50" />
                  <button type="submit" className="w-full py-3 rounded-xl bg-red-600 text-white text-xs font-bold cursor-pointer">
                    {t.deductAndSaveExp}
                  </button>
                </form>

                <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-2.5">
                  <h3 className="font-black text-sm text-slate-900">{t.recordedExpensesList}</h3>
                  {(expenses[currentUser.shopId] || []).map(exp => (
                    <div key={exp.id} className="p-3 rounded-2xl border border-slate-200 bg-slate-50 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-xs text-slate-900 block">{exp.title}</span>
                        <span className="text-[10px] text-slate-500">{exp.category} • {exp.date}</span>
                      </div>
                      <span className="font-black text-xs text-red-600">-{exp.amount} {t.currency}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {workerActiveTab === 'debts' && (
              <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="font-black text-sm text-slate-900">{t.pendingDebtsTitle}</h3>
                {(debts[currentUser.shopId] || []).length === 0 ? (
                  <p className="text-xs text-slate-400">{t.noDebtsForShop}</p>
                ) : (
                  (debts[currentUser.shopId] || []).map(d => (
                    <div key={d.id} className="p-3.5 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs text-slate-900">{d.debtorName}</span>
                        <span className="font-black text-xs text-amber-700">{d.amount} {t.currency}</span>
                      </div>
                      <p className="text-[11px] text-slate-600">{translateServiceType(d.service)} • {d.date}</p>
                      {settlingDebtId === d.id ? (
                        <div className="flex gap-2">
                          <select value={repayMethod} onChange={e => setRepayMethod(e.target.value)} className="px-2 py-1 rounded-lg border text-xs bg-white">
                            <option value="كاش">{t.cash}</option>
                            <option value="بنك">{t.bank}</option>
                          </select>
                          <button onClick={() => handleSettleDebtAction(currentUser.shopId, d)} className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold cursor-pointer">
                            {t.confirmSettle}
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setSettlingDebtId(d.id)} className="px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold cursor-pointer">
                          {t.settleDebtBtn}
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </main>
        </div>
      )}

      {/* نافذة الفاتورة والطباعة المشتركة */}
      {renderInvoiceModal()}
    </div>
  );
}