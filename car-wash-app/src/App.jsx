import React, { useState, useEffect, useRef } from 'react';
import { 
  Car, Shield, Users, Building, Plus, Printer, Camera, Phone, MapPin, Tag, 
  Settings, DollarSign, Mail, AlertTriangle, Trash2, Edit3, Image as ImageIcon, 
  RefreshCw, Bike, Bell, CheckSquare, Award, FileSpreadsheet, UserPlus, Wallet,
  LogOut, CheckCircle, UsersRound, Globe, ChevronDown
} from 'lucide-react';
import { auth, db } from './firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail, signOut } from 'firebase/auth';
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
import { translations } from './translations';

export default function App() {
  // 🌟 نظام اللغات المتكامل مع الحفظ في الـ LocalStorage
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('carWash_lang') || 'ar';
    } catch (e) {
      return 'ar';
    }
  });

  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef(null);

  const t = translations[lang] || translations.ar;

  const handleLanguageChange = (newLang) => {
    setLang(newLang);
    try {
      localStorage.setItem('carWash_lang', newLang);
    } catch (e) {}
    setIsLangDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    "Fiat Egea", "Fiat Linea", "Fiat Punto", "Fiat Doblo", "Fiat Fiorino", "Fiat Tipo",
    "Renault Megane", "Renault Clio", "Renault Fluence", "Renault Symbol", "Renault Talisman", "Renault Captur",
    "Ford Focus", "Ford Fiesta", "Ford Mondeo", "Ford Kuga", "Ford Transit", "Ford Ranger",
    "Toyota Corolla", "Toyota Yaris", "Toyota Camry", "Toyota RAV4", "Toyota Hilux",
    "VW Passat", "VW Golf", "VW Polo", "VW Tiguan", "VW Jetta",
    "Hyundai Accent", "Hyundai Elantra", "Hyundai Tucson", "Hyundai i20", "Hyundai Santa Fe",
    "Kia Sportage", "Kia Cerato", "Kia Rio", "Kia Sorento", "Kia Picanto",
    "Honda Civic", "Honda Accord", "Honda CR-V",
    "BMW 3 Series", "BMW 5 Series", "BMW X3",
    "Mercedes C-Class", "Mercedes E-Class", "Mercedes GLC",
    "Skoda Octavia", "Skoda Superb", "Skoda Kodiaq",
    "Dacia Duster", "Dacia Sandero",
    "Peugeot 3008", "Peugeot 208",
    "Opel Astra", "Opel Corsa",
    "Nissan Qashqai", "Nissan Sunny",
    "Togg T10X"
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
      showToast(t.refreshSuccess, 'success');
    }, 600);
  };

  const handleFirebaseLogin = async (e) => {
    e.preventDefault();
    if (!inputEmail || !inputPassword) return showToast(t.loginError, 'error');

    try {
      if (inputEmail.toLowerCase() === "munir@gmail.com") {
        setCurrentUser({ email: inputEmail, role: 'programmer', name: 'المبرمج (المدير العام)' });
        return;
      }

      const ownedShops = shops.filter(s => s.ownerEmail && s.ownerEmail.toLowerCase() === inputEmail.toLowerCase());
      if (ownedShops.length > 0) {
        const activeOrValidShops = ownedShops.filter(s => s.status !== 'suspended');
        if (activeOrValidShops.length === 0) {
          showToast(t.suspendedAccountMsg, 'error');
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
          showToast(t.suspendedShopMsg, 'error');
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

      showToast(t.loginError, 'error');
    } catch (error) {
      console.error(error);
      showToast(t.loginFailed, 'error');
    }
  };

  const handleForgotPassword = async () => {
    if (!inputEmail) {
      showToast(t.enterEmailFirst, 'error');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, inputEmail);
      showToast(t.resetSent, 'success');
    } catch (error) {
      console.error(error);
      showToast(t.resetError, 'error');
    }
  };

  const handleProgrammerAddClient = async (e) => {
    e.preventDefault();
    if (!newClientName || !newClientEmail || !newClientShopName || !newClientWorkerEmail || !newClientWorkerPass) {
      showToast(t.loginError, 'error');
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
      expiryDate = t.lifetimeDuration;
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
      <html lang="${lang}" dir="${t.dir}">
      <head>
        <meta charset="UTF-8">
        <title>${t.officialInvoiceBadge} - ${inv.plate}</title>
        <style>
          body { font-family: Tahoma, sans-serif; padding: 20px; text-align: ${t.dir === 'rtl' ? 'right' : 'left'}; }
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
            <p>${inv.shopInfo?.address || 'İskenderun'} | ${t.phoneLabel} <span dir="ltr">${inv.shopInfo?.phone || '+90...'}</span></p>
          </div>
          <div class="row"><span>${t.vehicleCatLabel}</span><strong>${inv.vehicleCategory} (${inv.carModel || ''})</strong></div>
          <div class="row"><span>${t.plateNumber}</span><strong>${inv.plate}</strong></div>
          <div class="row"><span>${t.serviceNameLabel}</span><strong>${inv.service}</strong></div>
          <div class="row"><span>${t.startTimePlaceholder} / ${t.endTimePlaceholder}:</span><strong>${inv.startTime || '-'} ➔ ${inv.endTime || '-'}</strong></div>
          <div class="row"><span>${t.paymentMethod}:</span><strong>${inv.method}</strong></div>
          ${inv.notes ? `<div class="row"><span>${t.notesOptional}:</span><strong>${inv.notes}</strong></div>` : ''}

          ${(inv.beforePhoto || inv.afterPhoto) ? `
            <div class="photos">
              ${inv.beforePhoto ? `<div><span style="font-size:10px;">${t.beforeBadge}</span><img src="${inv.beforePhoto}"/></div>` : ''}
              ${inv.afterPhoto ? `<div><span style="font-size:10px;">${t.afterBadge}</span><img src="${inv.afterPhoto}"/></div>` : ''}
            </div>
          ` : ''}

          <div class="total">${t.totalInvoiceAmount} ${inv.price} ${t.currency}</div>
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
      showToast(t.loginError, 'error');
      return;
    }
    const planTypeKey = newPlanType ? newPlanType.toLowerCase().replace(/\s+/g, '_') : ('plan_' + Date.now());
    const newPlanObj = {
      id: Date.now(),
      name: newPlanName,
      type: planTypeKey,
      price: Number(newPlanPrice),
      currency: t.currency,
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
    if (!expiryDateStr || expiryDateStr.includes('مدى الحياة') || expiryDateStr.includes('Ömür') || expiryDateStr.includes('Lifetime')) return t.lifetimeDuration;
    const diff = new Date(expiryDateStr) - new Date();
    if (diff <= 0) return t.expiredDuration;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return t.timeRemainingDaysHours.replace('{days}', days).replace('{hours}', hours);
  };

  // 🌟 المكون الاحترافي لزر تبديل اللغة (Language Switcher)
  const renderLanguageSwitcher = (theme = 'dark') => {
    const isDark = theme === 'dark';
    return (
      <div className="relative inline-block text-left" ref={langDropdownRef}>
        <button
          type="button"
          onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
          className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer transition shadow-sm border backdrop-blur-md ${
            isDark 
              ? 'bg-slate-800/80 hover:bg-slate-700 text-white border-slate-700' 
              : 'bg-white/90 hover:bg-slate-100 text-slate-800 border-slate-200'
          }`}
        >
          <Globe size={15} className="text-blue-400" />
          <span>{t.flag}</span>
          <span className="hidden sm:inline">{t.langName}</span>
          <ChevronDown size={13} className={`transition-transform duration-200 ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {isLangDropdownOpen && (
          <div className="absolute end-0 mt-2 w-36 rounded-2xl bg-white shadow-2xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => handleLanguageChange('ar')}
              className={`w-full text-start px-3.5 py-2 text-xs font-bold flex items-center gap-2.5 transition cursor-pointer ${
                lang === 'ar' ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>🇸🇦</span>
              <span>العربية</span>
            </button>
            <button
              onClick={() => handleLanguageChange('tr')}
              className={`w-full text-start px-3.5 py-2 text-xs font-bold flex items-center gap-2.5 transition cursor-pointer ${
                lang === 'tr' ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>🇹🇷</span>
              <span>Türkçe</span>
            </button>
            <button
              onClick={() => handleLanguageChange('en')}
              className={`w-full text-start px-3.5 py-2 text-xs font-bold flex items-center gap-2.5 transition cursor-pointer ${
                lang === 'en' ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>🇺🇸</span>
              <span>English</span>
            </button>
          </div>
        )}
      </div>
    );
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
        <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full space-y-6 border border-slate-100 text-start transform transition-all animate-in fade-in zoom-in-95 duration-200" dir={t.dir}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">{t.confirmRequired}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{t.confirmSub}</p>
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
              {t.confirmExecute}
            </button>
            <button 
              onClick={() => setConfirmModal({ isOpen: false, message: '', onConfirm: null })}
              className="px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold text-sm cursor-pointer transition"
            >
              {t.cancel}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans relative" dir={t.dir}>
        {renderToastComponent()}
        {renderConfirmModal()}
        
        {/* زر تبديل اللغة الأنيق في أعلى شاشة الدخول */}
        <div className="absolute top-6 end-6 z-20">
          {renderLanguageSwitcher('dark')}
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full space-y-6">
          <div className="bg-blue-100 text-blue-600 p-4 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto shadow-inner"><Car size={40} /></div>
          <div className="text-center">
            <h2 className="text-2xl font-black text-gray-800">{t.loginTitle}</h2>
            <p className="text-gray-500 text-sm mt-1">{t.loginSubtitle}</p>
          </div>
          <form onSubmit={handleFirebaseLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">{t.email}</label>
              <input 
                type="email" 
                value={inputEmail} 
                onChange={e => setInputEmail(e.target.value)} 
                onInvalid={e => e.target.setCustomValidity(t.emailValidation)}
                onInput={e => e.target.setCustomValidity('')}
                className="w-full px-4 py-3 border rounded-xl text-sm text-gray-900" 
                required 
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-gray-600">{t.password}</label>
                <button type="button" onClick={handleForgotPassword} className="text-xs text-blue-600 font-semibold cursor-pointer">{t.forgotPassword}</button>
              </div>
              <input 
                type="password" 
                value={inputPassword} 
                onChange={e => setInputPassword(e.target.value)} 
                onInvalid={e => e.target.setCustomValidity(t.passValidation)}
                onInput={e => e.target.setCustomValidity('')}
                className="w-full px-4 py-3 border rounded-xl text-sm text-gray-900" 
                required 
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-2xl font-bold text-sm cursor-pointer shadow-lg">{t.loginBtn}</button>
          </form>
        </div>
      </div>
    );
  }

  // ================= 🌟 واجهة المبرمج الاحترافية (SaaS Admin) =================
  if (currentUser.role === 'programmer') {
    const clientsMap = {};
    shops.forEach(s => {
      const email = s.ownerEmail ? s.ownerEmail.toLowerCase() : 'unknown@domain.com';
      if (!clientsMap[email]) {
        clientsMap[email] = {
          ownerName: s.owner || 'غير محدد',
          ownerEmail: email,
          taxNumber: s.taxNumber || 'غير مسجل',
          phone: s.phone || '+90...',
          discountPercent: s.discountPercent || 0,
          shopsList: []
        };
      }
      clientsMap[email].shopsList.push(s);
    });

    const clientsList = Object.values(clientsMap);
    const activeClientsList = clientsList.filter(client => client.shopsList.some(s => s.status === 'active'));
    const suspendedClientsList = clientsList.filter(client => client.shopsList.every(s => s.status === 'suspended'));
    const activeShopsCount = shops.filter(s => s.status === 'active').length;
    const selectedClient = clientsList.find(c => c.ownerEmail === selectedClientEmail);

    let totalSubscriptionRevenue = 0;
    activeClientsList.forEach(client => {
      const firstShop = client.shopsList[0] || {};
      const basePrice = firstShop.subscriptionType === 'yearly' ? 5000 : firstShop.subscriptionType === 'lifetime' ? 15000 : firstShop.subscriptionType === 'trial' ? 0 : 500;
      const discount = client.discountPercent || 0;
      const discountedPrice = basePrice * (1 - discount / 100);
      totalSubscriptionRevenue += discountedPrice * client.shopsList.filter(s => s.status === 'active').length;
    });

    const clientsWithDiscounts = clientsList.filter(c => c.discountPercent > 0);
    const vipClients = activeClientsList.filter(c => c.shopsList.length >= 3);
    const regularClients = activeClientsList.filter(c => c.shopsList.length < 3);

    return (
      <div className="min-h-screen bg-slate-100 font-sans" dir={t.dir}>
        {renderToastComponent()}
        {renderConfirmModal()}

        <header className="bg-slate-950 border-b border-slate-800 text-white px-6 py-4 shadow-xl flex justify-between items-center gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Shield size={22} />
            </div>
            <div>
              <span className="font-extrabold text-white text-base">{t.programmerTitle}</span>
              <p className="text-xs text-slate-400">{t.programmerSubtitle}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {renderLanguageSwitcher('dark')}
            <button onClick={handleLogout} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 transition">
              <LogOut size={15} /> {t.logout}
            </button>
          </div>
        </header>

        <nav className="bg-white border-b border-slate-200 px-6 py-3 flex gap-2 text-xs md:text-sm font-bold shadow-xs overflow-x-auto">
          <button onClick={() => { setProgrammerTab('clients'); setSelectedClientEmail(null); }} className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${programmerTab === 'clients' && !selectedClientEmail ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20' : 'text-slate-600 hover:bg-slate-100'}`}>
            {t.activeClientsTab}
          </button>
          <button onClick={() => { setProgrammerTab('suspendedClients'); setSelectedClientEmail(null); }} className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${programmerTab === 'suspendedClients' ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20' : 'text-slate-600 hover:bg-slate-100'}`}>
            {t.suspendedClientsTab} ({suspendedClientsList.length})
          </button>
          <button onClick={() => { setProgrammerTab('addClient'); setSelectedClientEmail(null); }} className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${programmerTab === 'addClient' ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20' : 'text-slate-600 hover:bg-slate-100'}`}>
            {t.addClientTab}
          </button>
          <button onClick={() => { setProgrammerTab('pricingPlans'); setSelectedClientEmail(null); }} className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${programmerTab === 'pricingPlans' ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20' : 'text-slate-600 hover:bg-slate-100'}`}>
            {t.pricingPlansTab}
          </button>
          <button onClick={() => { setProgrammerTab('directDiscounts'); setSelectedClientEmail(null); }} className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${programmerTab === 'directDiscounts' ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20' : 'text-slate-600 hover:bg-slate-100'}`}>
            {t.directDiscountsTab}
          </button>
          <button onClick={() => { setProgrammerTab('subscriptionsReport'); setSelectedClientEmail(null); }} className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${programmerTab === 'subscriptionsReport' ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20' : 'text-slate-600 hover:bg-slate-100'}`}>
            {t.subscriptionsReportTab}
          </button>
        </nav>

        <main className="max-w-7xl mx-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
              <span className="text-gray-500 text-sm">{t.activeClientsStat}</span>
              <h3 className="text-3xl font-black text-slate-900 mt-1">{activeClientsList.length}</h3>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-blue-100">
              <span className="text-gray-500 text-sm">{t.totalShopsStat}</span>
              <h3 className="text-3xl font-black text-blue-600 mt-1">{shops.length}</h3>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-100">
              <span className="text-gray-500 text-sm">{t.activeShopsStat}</span>
              <h3 className="text-3xl font-black text-emerald-600 mt-1">{activeShopsCount}</h3>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-purple-100">
              <span className="text-gray-500 text-sm">{t.totalRevenueStat}</span>
              <h3 className="text-3xl font-black text-purple-600 mt-1">{totalSubscriptionRevenue} {t.currency}</h3>
            </div>
          </div>

          {programmerTab === 'clients' && !selectedClient && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
                <h3 className="font-bold text-purple-900 text-lg flex items-center gap-2">
                  <Award className="text-purple-600" size={22} /> {t.vipClientsTitle}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vipClients.length === 0 ? <p className="text-xs text-gray-400">{t.noVipClients}</p> : vipClients.map((client, idx) => (
                    <div key={idx} className="p-5 rounded-2xl border-2 border-purple-200 bg-purple-50/20 flex flex-col justify-between space-y-4">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-black text-lg text-slate-900">⭐ {client.ownerName}</h4>
                          <span className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-xl shadow-xs">
                            🏢 {client.shopsList.length} {t.branchesCount}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">{t.phoneLabel} <span dir="ltr">{client.phone}</span></p>
                        {client.discountPercent > 0 && <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded">{t.activeDiscountLabel} {client.discountPercent}%</span>}
                      </div>
                      <button onClick={() => setSelectedClientEmail(client.ownerEmail)} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer">
                        {t.viewFullFile}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  <Users className="text-blue-600" size={22} /> {t.regularClientsTitle}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {regularClients.length === 0 ? <p className="text-xs text-gray-400">{t.noRegularClients}</p> : regularClients.map((client, idx) => (
                    <div key={idx} className="p-5 rounded-2xl border bg-gray-50 flex flex-col justify-between space-y-4">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-black text-lg text-slate-900">👤 {client.ownerName}</h4>
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-xl shadow-xs">
                            🏢 {client.shopsList.length} {t.branchCount}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">{t.phoneLabel} <span dir="ltr">{client.phone}</span></p>
                        {client.discountPercent > 0 && <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded">{t.activeDiscountLabel} {client.discountPercent}%</span>}
                      </div>
                      <button onClick={() => setSelectedClientEmail(client.ownerEmail)} className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer">
                        {t.viewFullFile}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {programmerTab === 'suspendedClients' && (
            <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
              <h3 className="font-bold text-amber-900 text-lg flex items-center gap-2">
                {t.suspendedArchiveTitle}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suspendedClientsList.length === 0 ? (
                  <p className="text-xs text-gray-400">{t.noSuspendedClients}</p>
                ) : (
                  suspendedClientsList.map((client, idx) => (
                    <div key={idx} className="p-5 rounded-2xl border-2 border-amber-200 bg-amber-50/20 flex flex-col justify-between space-y-4">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-black text-lg text-slate-900">👤 {client.ownerName}</h4>
                          <span className="px-3 py-1 bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs">
                            {t.suspendedBadge}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">{t.phoneLabel} <span dir="ltr">{client.phone}</span></p>
                        <p className="text-xs text-red-600 font-semibold mt-1">عدد الفروع المعلقة: {client.shopsList.length}</p>
                      </div>
                      <button onClick={() => setSelectedClientEmail(client.ownerEmail)} className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer">
                        {t.manageAndActivate}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {programmerTab === 'addClient' && (
            <div className="bg-white p-8 rounded-3xl shadow-sm border max-w-2xl mx-auto space-y-6">
              <div className="flex items-center gap-3 border-b pb-4">
                <div className="bg-purple-100 text-purple-600 p-3 rounded-2xl"><UserPlus size={24} /></div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{t.addNewClientTitle}</h3>
                  <p className="text-xs text-gray-500">{t.addNewClientSubtitle}</p>
                </div>
              </div>

              <form onSubmit={handleProgrammerAddClient} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">{t.clientFullName}</label>
                    <input type="text" placeholder="مثال: خالد أحمد" value={newClientName} onChange={e => setNewClientName(e.target.value)} onInvalid={e => e.target.setCustomValidity('يرجى إدخال اسم العميل')} onInput={e => e.target.setCustomValidity('')} className="w-full px-3 py-2.5 border rounded-xl text-sm text-gray-900 bg-white" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">{t.clientEmail}</label>
                    <input type="email" placeholder="khaled@gmail.com" value={newClientEmail} onChange={e => setNewClientEmail(e.target.value)} onInvalid={e => e.target.setCustomValidity('يرجى إدخال البريد الإلكتروني')} onInput={e => e.target.setCustomValidity('')} className="w-full px-3 py-2.5 border rounded-xl text-sm text-gray-900 bg-white" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">{t.clientPhone}</label>
                    <input type="text" dir="ltr" maxLength={11} placeholder="05XXXXXXXXX" value={newClientPhone} onChange={e => setNewClientPhone(e.target.value.replace(/\D/g, '').slice(0, 11))} className="w-full px-3 py-2.5 border rounded-xl text-sm text-gray-900 bg-white text-start" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">{t.clientTax}</label>
                    <input type="text" value={newClientTax} onChange={e => setNewClientTax(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl text-sm text-gray-900 bg-white" />
                  </div>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <h4 className="font-bold text-sm text-purple-700">{t.firstBranchDetails}</h4>
                  <input type="text" placeholder={t.firstBranchName} value={newClientShopName} onChange={e => setNewClientShopName(e.target.value)} onInvalid={e => e.target.setCustomValidity('يرجى إدخال اسم الفرع الأول')} onInput={e => e.target.setCustomValidity('')} className="w-full px-3 py-2.5 border rounded-xl text-sm text-gray-900 bg-white" required />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">{t.workerEmail}</label>
                      <input type="email" placeholder="worker@gmail.com" value={newClientWorkerEmail} onChange={e => setNewClientWorkerEmail(e.target.value)} onInvalid={e => e.target.setCustomValidity('يرجى إدخال بريد العامل')} onInput={e => e.target.setCustomValidity('')} className="w-full px-3 py-2.5 border rounded-xl text-sm text-gray-900 bg-white" required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">{t.workerPass}</label>
                      <input type="password" placeholder="••••••••" value={newClientWorkerPass} onChange={e => setNewClientWorkerPass(e.target.value)} onInvalid={e => e.target.setCustomValidity('يرجى إدخال كلمة سر العامل')} onInput={e => e.target.setCustomValidity('')} className="w-full px-3 py-2.5 border rounded-xl text-sm text-gray-900 bg-white" required />
                    </div>
                  </div>

                  <input type="text" placeholder={t.branchAddress} value={newClientAddress} onChange={e => setNewClientAddress(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl text-sm text-gray-900 bg-white" />
                </div>

                <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3.5 rounded-xl font-bold text-sm cursor-pointer shadow-md">{t.registerClientBtn}</button>
              </form>
            </div>
          )}

          {programmerTab === 'pricingPlans' && (
            <div className="space-y-8 max-w-5xl mx-auto">
              <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-purple-600 to-indigo-600"></div>
                <div className="flex items-center gap-3 border-b pb-4">
                  <div className="bg-purple-100 text-purple-600 p-3 rounded-2xl"><Plus size={24} /></div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900">{t.addNewPlanTitle}</h3>
                    <p className="text-xs text-gray-500">{t.addNewPlanSub}</p>
                  </div>
                </div>

                <form onSubmit={handleAddPricingPlan} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">{t.planName}</label>
                      <input 
                        type="text" 
                        placeholder="مثال: الباقة الذهبية" 
                        value={newPlanName} 
                        onChange={e => setNewPlanName(e.target.value)} 
                        onInvalid={e => e.target.setCustomValidity('يرجى إدخال اسم الباقة')}
                        onInput={e => e.target.setCustomValidity('')}
                        className="w-full px-4 py-3 border rounded-xl text-sm bg-slate-50 focus:bg-white text-gray-900 font-semibold" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">{t.planKeyEn}</label>
                      <input 
                        type="text" 
                        placeholder="gold_plan" 
                        value={newPlanType} 
                        onChange={e => setNewPlanType(e.target.value)} 
                        className="w-full px-4 py-3 border rounded-xl text-sm bg-slate-50 focus:bg-white text-gray-900 font-semibold font-mono" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">{t.planPrice}</label>
                      <input 
                        type="number" 
                        placeholder="7500" 
                        value={newPlanPrice} 
                        onChange={e => setNewPlanPrice(e.target.value)} 
                        onInvalid={e => e.target.setCustomValidity('يرجى تحديد السعر')}
                        onInput={e => e.target.setCustomValidity('')}
                        className="w-full px-4 py-3 border rounded-xl text-sm bg-slate-50 focus:bg-white text-gray-900 font-bold" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">{t.planMaxShops}</label>
                      <input 
                        type="number" 
                        placeholder="7" 
                        value={newPlanMaxShops} 
                        onChange={e => setNewPlanMaxShops(e.target.value)} 
                        onInvalid={e => e.target.setCustomValidity('يرجى تحديد الحد الأقصى للفروع')}
                        onInput={e => e.target.setCustomValidity('')}
                        className="w-full px-4 py-3 border rounded-xl text-sm bg-slate-50 focus:bg-white text-gray-900 font-bold" 
                        required 
                      />
                    </div>
                  </div>

                  <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3.5 rounded-xl font-bold text-sm cursor-pointer shadow-md transition">
                    {t.addNewPlanBtn}
                  </button>
                </form>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 space-y-6">
                <div className="flex justify-between items-center border-b pb-4">
                  <h3 className="font-black text-lg text-gray-900">{t.currentPlansTitle} ({pricingPlans.length}):</h3>
                  <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold">{t.fullControlBadge}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {pricingPlans.map(plan => (
                    <div key={plan.id} className="p-5 border-2 rounded-2xl bg-slate-50 flex flex-col justify-between space-y-4 relative shadow-xs">
                      {editingPlanId === plan.id ? (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[11px] font-bold text-gray-600 mb-1">{t.planName}:</label>
                            <input type="text" value={editPlanName} onChange={e => setEditPlanName(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm font-bold text-gray-900 bg-white" />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-gray-600 mb-1">{t.planPrice}:</label>
                            <input type="number" value={editPlanPrice} onChange={e => setEditPlanPrice(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm font-bold text-gray-900 bg-white" />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-gray-600 mb-1">{t.planMaxShops}:</label>
                            <input type="number" value={editPlanMaxShops} onChange={e => setEditPlanMaxShops(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm font-bold text-gray-900 bg-white" />
                          </div>
                          <div className="flex gap-2 pt-2">
                            <button onClick={() => handleSaveEditPlan(plan.id)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-xs font-bold">{t.save}</button>
                            <button onClick={() => setEditingPlanId(null)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-xl text-xs font-bold">{t.cancel}</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-1">
                            <div className="flex justify-between items-start">
                              <h4 className="font-black text-lg text-slate-900">{plan.name}</h4>
                              <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-mono font-bold">{plan.type}</span>
                            </div>
                            <p className="text-2xl font-black text-purple-600 pt-1">{plan.price} {t.currency}</p>
                            <div className="pt-2">
                              <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-xl border border-blue-200">
                                {t.maxShopsAllowed} {plan.maxShops} {t.branchesCount}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-3 border-t">
                            <button onClick={() => handleStartEditPlan(plan)} className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1">
                              <Edit3 size={13} /> {t.edit}
                            </button>
                            <button onClick={() => handleDeletePricingPlan(plan.id)} className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1">
                              <Trash2 size={13} /> {t.delete}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {programmerTab === 'directDiscounts' && (
            <div className="bg-white p-8 rounded-3xl shadow-sm border max-w-4xl mx-auto space-y-6">
              <div className="border-b pb-4">
                <h3 className="text-xl font-bold text-gray-900">{t.directDiscountsTitle}</h3>
                <p className="text-xs text-gray-500">{t.directDiscountsSubtitle}</p>
              </div>

              <form onSubmit={handleApplyDirectDiscountToClient} className="bg-purple-50/60 p-5 rounded-2xl border border-purple-200 space-y-3">
                <h4 className="font-bold text-sm text-purple-900">{t.applyDiscountHeading}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <select 
                    value={targetClientEmailForDiscount} 
                    onChange={e => setTargetClientEmailForDiscount(e.target.value)} 
                    className="px-3 py-2.5 border rounded-xl text-sm bg-white text-gray-900 font-bold"
                    required
                  >
                    <option value="">{t.selectClientOption}</option>
                    {activeClientsList.map((c, i) => <option key={i} value={c.ownerEmail}>{c.ownerName}</option>)}
                  </select>
                  <input 
                    type="number" 
                    placeholder={t.discountPercentPlaceholder} 
                    value={directDiscountValue} 
                    onChange={e => setDirectDiscountValue(e.target.value)} 
                    className="px-3 py-2.5 border rounded-xl text-sm bg-white text-gray-900 font-bold" 
                    required 
                  />
                </div>
                <div className="flex justify-end pt-1">
                  <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs cursor-pointer shadow-sm">
                    {t.applyDiscountBtn}
                  </button>
                </div>
              </form>

              <div className="space-y-3 pt-4">
                <h4 className="font-bold text-gray-900 text-base">{t.clientsWithDiscountsTitle} ({clientsWithDiscounts.length}):</h4>
                {clientsWithDiscounts.length === 0 ? (
                  <p className="text-xs text-gray-500">{t.noClientsWithDiscounts}</p>
                ) : (
                  clientsWithDiscounts.map((client, idx) => (
                    <div key={idx} className="p-4 rounded-xl border bg-emerald-50/50 border-emerald-200 flex justify-between items-center text-sm">
                      <div>
                        <span className="font-bold text-slate-900">👤 {client.ownerName}</span>
                        <p className="text-xs text-emerald-700 font-bold mt-0.5">{t.activeDiscountOnAllShops} {client.discountPercent}%</p>
                      </div>
                      <button 
                        onClick={async () => {
                          const clientShops = shops.filter(s => s.ownerEmail.toLowerCase() === client.ownerEmail.toLowerCase());
                          for (const shop of clientShops) {
                            await updateDoc(doc(db, "platformShops", String(shop.id)), { discountPercent: 0 });
                          }
                          showToast('تم إزالة الخصم عن العميل بنجاح.', 'success');
                        }}
                        className="bg-red-100 text-red-700 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        {t.cancelDiscount}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {selectedClient && (
            <div className="bg-white p-8 rounded-3xl shadow-sm border space-y-6">
              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <span className="text-xs font-bold text-purple-600 uppercase">{t.clientCommercialFile}</span>
                  <h2 className="text-2xl font-black text-slate-900 mt-1">👤 {selectedClient.ownerName}</h2>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button 
                    onClick={() => setEditingClientData({ ownerName: selectedClient.ownerName, ownerEmail: selectedClient.ownerEmail, taxNumber: selectedClient.taxNumber, phone: selectedClient.phone })}
                    className="bg-blue-100 text-blue-700 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    {t.edit} ✏️
                  </button>
                  <button 
                    onClick={() => handleSuspendClientForMonths(selectedClient.ownerEmail)}
                    className="bg-amber-100 text-amber-800 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    {t.suspendGracePeriod}
                  </button>
                  <button 
                    onClick={() => setSelectedClientEmail(null)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    {t.back}
                  </button>
                </div>
              </div>

              {editingClientData && (
                <form onSubmit={handleSaveClientEdits} className="bg-blue-50 p-5 rounded-2xl border border-blue-200 space-y-3">
                  <h4 className="font-bold text-sm text-blue-900">{t.editClientDataTitle}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input type="text" value={editingClientData.ownerName} onChange={e => setEditingClientData({...editingClientData, ownerName: e.target.value})} placeholder="اسم العميل" className="px-3 py-2 border rounded-xl text-xs bg-white text-gray-900" required />
                    <input type="text" dir="ltr" maxLength={11} value={editingClientData.phone} onChange={e => setEditingClientData({...editingClientData, phone: e.target.value.replace(/\D/g, '').slice(0, 11)})} placeholder="05XXXXXXXXX" className="px-3 py-2 border rounded-xl text-xs bg-white text-gray-900 text-start" />
                    <input type="text" value={editingClientData.taxNumber} onChange={e => setEditingClientData({...editingClientData, taxNumber: e.target.value})} placeholder="الرقم الضريبي" className="px-3 py-2 border rounded-xl text-xs bg-white text-gray-900" />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer">{t.save}</button>
                    <button type="button" onClick={() => setEditingClientData(null)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer">{t.cancel}</button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-purple-50/50 p-5 rounded-2xl border border-purple-100">
                <div>
                  <span className="text-xs text-gray-500 block">{t.phoneLabel}</span>
                  <strong className="text-sm text-slate-900" dir="ltr">{selectedClient.phone}</strong>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">{t.taxNumberLabel}</span>
                  <strong className="text-sm text-purple-700 font-mono text-base">{selectedClient.taxNumber}</strong>
                </div>
              </div>

              <div className="p-6 bg-slate-900 text-white rounded-3xl space-y-4 shadow-xl">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <h4 className="font-extrabold text-base">{t.manageClientSubsHeading}</h4>
                    <p className="text-xs text-slate-300 mt-0.5">{t.ownsShopsCount.replace('{count}', selectedClient.shopsList.length)}</p>
                  </div>
                  <button 
                    onClick={() => handleRemoveClientSubscription(selectedClient.ownerEmail)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition shadow-md flex items-center gap-1.5"
                  >
                    <Trash2 size={15} /> {t.cancelSubBtn}
                  </button>
                </div>

                <div className="flex gap-2 flex-wrap pt-2 border-t border-slate-800">
                  {pricingPlans.map(plan => (
                    <button 
                      key={plan.id} 
                      onClick={() => handleUpdateClientSubscription(selectedClient.ownerEmail, plan.type)} 
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition shadow-sm flex items-center gap-1.5"
                    >
                      <span>📅</span> {t.grantPlanBtn.replace('{name}', plan.name).replace('{max}', plan.maxShops)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-gray-900 text-base">{t.shopsBelongingToClient} ({selectedClient.shopsList.length}):</h4>
                {selectedClient.shopsList.map(shop => (
                  <div key={shop.id} className={`p-4 rounded-2xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${shop.status === 'suspended' ? 'bg-red-50 border-red-200' : 'bg-gray-50'}`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-gray-900">🏪 {shop.name}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${shop.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {shop.status === 'active' ? t.activeStatus : t.suspendedStatus}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">📍 {t.branchAddress}: {shop.address} | {t.phoneLabel} <span dir="ltr">{shop.phone}</span></p>
                      <div className="mt-1 text-xs font-bold text-blue-600">
                        {t.basicSubGranted} {shop.subscriptionType === 'trial' ? t.trialText : shop.subscriptionType} | {t.expiresIn} {shop.subscriptionExpiry || t.unspecified}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {shop.status === 'active' ? (
                        <button onClick={() => handleSuspendShop(shop.id)} className="bg-red-100 text-red-700 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer">
                          {t.stopShop}
                        </button>
                      ) : (
                        <button onClick={() => handleActivateShop(shop.id)} className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer">
                          {t.activateShop}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {programmerTab === 'subscriptionsReport' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-purple-900 to-slate-900 text-white p-6 rounded-3xl shadow-lg flex items-center justify-between">
                  <div>
                    <span className="text-purple-300 text-xs font-bold uppercase tracking-wider">{t.totalRevenueStat}</span>
                    <h3 className="text-3xl font-black text-emerald-400 mt-1">{totalSubscriptionRevenue} {t.currency}</h3>
                  </div>
                  <div className="bg-white/10 p-4 rounded-2xl"><Wallet size={28} className="text-purple-300" /></div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border flex items-center justify-between">
                  <div>
                    <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">{t.activeClientsStat}</span>
                    <h3 className="text-3xl font-black text-slate-900 mt-1">{activeClientsList.length}</h3>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-2xl"><UsersRound size={28} className="text-purple-600" /></div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border flex items-center justify-between">
                  <div>
                    <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">{t.activeShopsStat}</span>
                    <h3 className="text-3xl font-black text-blue-600 mt-1">{activeShopsCount}</h3>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-2xl"><Building size={28} className="text-blue-600" /></div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                    <FileSpreadsheet className="text-purple-600" size={22} /> {t.subsStatementTitle}
                  </h3>
                  <button 
                    onClick={handleRefreshData} 
                    disabled={isRefreshing}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition border"
                  >
                    <RefreshCw size={14} className={isRefreshing ? "animate-spin text-blue-600" : ""} /> 
                    {isRefreshing ? t.refreshing : t.refreshData}
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-start text-sm">
                    <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                      <tr>
                        <th className="p-3">{t.shopOwnerCol}</th>
                        <th className="p-3">{t.activeBranchesCol}</th>
                        <th className="p-3">{t.planTypeCol}</th>
                        <th className="p-3">{t.directDiscountCol}</th>
                        <th className="p-3">{t.netRevenueCol}</th>
                        <th className="p-3">{t.subExpiryCol}</th>
                        <th className="p-3">{t.generalStatusCol}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {activeClientsList.map((client, idx) => {
                        const firstShop = client.shopsList.find(s => s.status === 'active') || client.shopsList[0] || {};
                        const activeShopsForClient = client.shopsList.filter(s => s.status === 'active').length;
                        const basePrice = firstShop.subscriptionType === 'yearly' ? 5000 : firstShop.subscriptionType === 'lifetime' ? 15000 : firstShop.subscriptionType === 'trial' ? 0 : 500;
                        const disc = client.discountPercent || 0;
                        const finalPrice = (basePrice * (1 - disc / 100)) * activeShopsForClient;

                        return (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="p-3 font-bold text-slate-900">👤 {client.ownerName}</td>
                            <td className="p-3 font-bold text-purple-700">🏢 {activeShopsForClient} {t.branchesCount}</td>
                            <td className="p-3 font-semibold text-blue-600">{firstShop.subscriptionType === 'trial' ? t.trialText : firstShop.subscriptionType}</td>
                            <td className="p-3 font-bold text-emerald-600">{disc > 0 ? `${disc}%` : t.noDiscount}</td>
                            <td className="p-3 font-black text-purple-700">{finalPrice} {t.currency}</td>
                            <td className="p-3 font-mono">{firstShop.subscriptionExpiry || t.unspecified}</td>
                            <td className="p-3">
                              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                                {t.activeStatus}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  // ================= شاشة العامل =================
  if (currentUser.role === 'worker') {
    const shopId = currentUser.shopId;
    const shopTx = transactions[shopId] || [];
    const shopDebts = debts[shopId] || [];
    const shopAnnouncementsList = announcements[shopId] || [];

    const filteredWorkerTx = shopTx.filter(t => {
      const matchDate = !selectedDateFilter || t.date === selectedDateFilter;
      const matchPlate = !plateSearchQuery || (t.plate && t.plate.toLowerCase().includes(plateSearchQuery.toLowerCase()));
      return matchDate && matchPlate;
    });

    return (
      <div className="min-h-screen bg-slate-100 font-sans" dir={t.dir}>
        {renderToastComponent()}
        {renderConfirmModal()}

        <header className="bg-slate-950 border-b border-slate-800 text-white px-6 py-4 shadow-xl flex justify-between items-center gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <Car size={22} />
            </div>
            <div>
              <h1 className="font-extrabold text-white text-base">{currentUser.shopName}</h1>
              <span className="text-xs text-cyan-300 font-medium">{t.activeWorkerScreen}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {renderLanguageSwitcher('dark')}
            <button onClick={handleLogout} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 transition">
              <LogOut size={15} /> {t.logout}
            </button>
          </div>
        </header>

        <main className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
          {shopAnnouncementsList.length > 0 && (
            <div className="space-y-2">
              {shopAnnouncementsList.map(ann => (
                <div key={ann.id} className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-4 rounded-2xl shadow-md flex items-start gap-3">
                  <Bell className="mt-0.5 shrink-0 animate-bounce" size={22} />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h4 className="font-black text-sm">{ann.title}</h4>
                      <span className="text-[11px] bg-amber-700/50 px-2 py-0.5 rounded-lg">{ann.date}</span>
                    </div>
                    <p className="text-xs text-amber-100 mt-1">{ann.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Car className="text-blue-600" /> {editingTxId ? t.editVehicleInfo : t.registerNewWash}
                </h3>
                <form onSubmit={handleAddTransaction} className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-700">{t.vehicleType}</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => setVehicleCategory('سيارة')} className={`py-2.5 text-xs font-bold rounded-xl border cursor-pointer flex items-center justify-center gap-1.5 ${vehicleCategory === 'سيارة' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-800'}`}>
                        <Car size={16} /> {t.car}
                      </button>
                      <button type="button" onClick={() => setVehicleCategory('موتور')} className={`py-2.5 text-xs font-bold rounded-xl border cursor-pointer flex items-center justify-center gap-1.5 ${vehicleCategory === 'موتور' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-800'}`}>
                        <Bike size={16} /> {t.motorcycle}
                      </button>
                    </div>
                  </div>

                  {vehicleCategory === 'سيارة' && (
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">{t.selectCarModel}</label>
                      <input 
                        type="text" 
                        list="carModelsLibrary" 
                        placeholder={t.searchCarPlaceholder} 
                        value={carModel} 
                        onChange={e => setCarModel(e.target.value)} 
                        onInvalid={e => e.target.setCustomValidity('يرجى تحديد موديل السيارة')}
                        onInput={e => e.target.setCustomValidity('')}
                        className="w-full px-3 py-2 border rounded-xl text-sm bg-white text-gray-900 font-semibold outline-none focus:ring-2 focus:ring-blue-500" 
                        required 
                      />
                      <datalist id="carModelsLibrary">
                        {comprehensiveCarLibrary.map((car, idx) => (
                          <option key={idx} value={car} />
                        ))}
                      </datalist>
                    </div>
                  )}

                  <input type="text" placeholder={t.plateNumber} value={plateNumber} onChange={e => setPlateNumber(e.target.value)} onInvalid={e => e.target.setCustomValidity('يرجى إدخال رقم اللوحة')} onInput={e => e.target.setCustomValidity('')} className="w-full px-3 py-2 border rounded-xl uppercase font-bold text-sm text-gray-900" required />
                  
                  <select value={serviceType} onChange={e => setServiceType(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm bg-white text-gray-900">
                    {t.servicesList.map((srv, idx) => (
                      <option key={idx} value={srv}>{srv}</option>
                    ))}
                  </select>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" value={startTime} onChange={e => setStartTime(e.target.value)} placeholder={t.startTimePlaceholder} className="px-3 py-2 border rounded-xl text-sm text-center font-bold text-gray-900" />
                    <input type="text" value={endTime} onChange={e => setEndTime(e.target.value)} placeholder={t.endTimePlaceholder} className="px-3 py-2 border rounded-xl text-sm text-center font-bold text-gray-900" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">{t.priceManual}</label>
                    <input type="number" placeholder={t.enterPricePlaceholder} value={price} onChange={e => setPrice(e.target.value)} onInvalid={e => e.target.setCustomValidity('يرجى إدخال السعر المطلوب')} onInput={e => e.target.setCustomValidity('')} className="w-full px-3 py-2.5 border-2 border-blue-400 rounded-xl font-black text-blue-700 text-base outline-none bg-blue-50/50" required />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">{t.notesOptional}</label>
                    <input type="text" placeholder={t.notesPlaceholder} value={txNotes} onChange={e => setTxNotes(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs text-gray-900 bg-white" />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-gray-700">{t.photoDocumentation}</label>
                    
                    <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-2xl space-y-2">
                      <span className="text-[11px] font-bold text-blue-900 block">{t.beforeWashPhoto} {beforePhoto ? t.photoAddedCheck : ''}</span>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs">
                          <Camera size={16} /> {t.openCamera}
                          <input type="file" accept="image/*" capture="environment" onChange={e => handleImageUpload(e, 'before')} className="hidden" />
                        </label>
                        <label className="flex items-center justify-center gap-1.5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl cursor-pointer shadow-xs">
                          <ImageIcon size={16} /> {t.fromGallery}
                          <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'before')} className="hidden" />
                        </label>
                      </div>
                    </div>

                    <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-2">
                      <span className="text-[11px] font-bold text-emerald-900 block">{t.afterWashPhoto} {afterPhoto ? t.photoAddedCheck : ''}</span>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs">
                          <Camera size={16} /> {t.openCamera}
                          <input type="file" accept="image/*" capture="environment" onChange={e => handleImageUpload(e, 'after')} className="hidden" />
                        </label>
                        <label className="flex items-center justify-center gap-1.5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl cursor-pointer shadow-xs">
                          <ImageIcon size={16} /> {t.fromGallery}
                          <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'after')} className="hidden" />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-700">{t.paymentMethod}</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button type="button" onClick={() => setPayMethod('كاش')} className={`py-2 rounded-xl text-xs font-bold border cursor-pointer ${payMethod === 'كاش' ? 'bg-emerald-600 text-white' : 'bg-gray-50 text-gray-800'}`}>{t.cash}</button>
                      <button type="button" onClick={() => setPayMethod('بنك')} className={`py-2 rounded-xl text-xs font-bold border cursor-pointer ${payMethod === 'بنك' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-800'}`}>{t.bank}</button>
                      <button type="button" onClick={() => setPayMethod('دين')} className={`py-2 rounded-xl text-xs font-bold border cursor-pointer ${payMethod === 'دين' ? 'bg-red-600 text-white' : 'bg-gray-50 text-gray-800'}`}>{t.debt}</button>
                    </div>
                  </div>

                  {payMethod === 'دين' && (
                    <div className="bg-red-50 p-3 rounded-xl border border-red-200 space-y-2">
                      <span className="text-xs font-bold text-red-700 block">{t.debtorDetails}</span>
                      <input type="text" placeholder={t.debtorFullName} value={debtorName} onChange={e => setDebtorName(e.target.value)} onInvalid={e => e.target.setCustomValidity('يرجى إدخال اسم الزبون')} onInput={e => e.target.setCustomValidity('')} className="w-full px-3 py-2 border rounded-xl text-xs bg-white text-gray-900 font-semibold" required />
                      <input type="text" dir="ltr" maxLength={11} placeholder="05XXXXXXXXX *" value={debtorPhone} onChange={e => setDebtorPhone(e.target.value.replace(/\D/g, '').slice(0, 11))} onInvalid={e => e.target.setCustomValidity('يرجى إدخال رقم الهاتف')} onInput={e => e.target.setCustomValidity('')} className="w-full px-3 py-2 border rounded-xl text-xs bg-white text-gray-900 font-semibold text-start" required />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white py-3.5 rounded-xl font-bold text-sm cursor-pointer shadow-md">
                      {editingTxId ? t.updateInfo : t.saveOrderAndRefresh}
                    </button>
                    {editingTxId && (
                      <button type="button" onClick={() => { setEditingTxId(null); setPlateNumber(''); setCarModel(''); setPrice(''); setTxNotes(''); }} className="px-4 bg-gray-200 text-gray-700 rounded-xl font-bold text-xs">{t.cancel}</button>
                    )}
                  </div>
                </form>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2"><Tag className="text-red-600" size={18} /> {t.recordExpenseFor} {currentUser.shopName}</h3>
                <form onSubmit={handleAddExpense} className="space-y-3">
                  <select value={expCategory} onChange={e => setExpCategory(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm bg-white text-gray-900">
                    {t.expCategories.map((c, i) => (
                      <option key={i} value={c}>{c}</option>
                    ))}
                  </select>
                  <input type="text" placeholder={t.expTitlePlaceholder} value={expTitle} onChange={e => setExpTitle(e.target.value)} onInvalid={e => e.target.setCustomValidity('يرجى إدخال عنوان المصروف')} onInput={e => e.target.setCustomValidity('')} className="w-full px-3 py-2 border rounded-xl text-sm text-gray-900" required />
                  <input type="number" placeholder={t.expAmountPlaceholder} value={expAmount} onChange={e => setExpAmount(e.target.value)} onInvalid={e => e.target.setCustomValidity('يرجى إدخال مبلغ المصروف')} onInput={e => e.target.setCustomValidity('')} className="w-full px-3 py-2 border rounded-xl text-sm text-gray-900" required />
                  <textarea placeholder={t.expNotesPlaceholder} value={expNotes} onChange={e => setExpNotes(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm h-16 resize-none text-gray-900" />
                  <button type="submit" className="w-full bg-red-600 text-white py-2.5 rounded-xl text-sm font-bold cursor-pointer">{t.deductAndSaveExp}</button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="font-bold text-amber-800 flex items-center gap-2">{t.pendingDebtsTitle}</h3>
                </div>
                {shopDebts.length === 0 ? (
                  <p className="text-xs text-gray-400">{t.noDebtsForShop}</p>
                ) : (
                  <div className="space-y-3">
                    {shopDebts.map(d => (
                      <div key={d.id} className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-sm">
                        <div>
                          <span className="font-bold text-gray-900">{t.customerLabel} {d.debtorName} (<span dir="ltr">{d.phone}</span>)</span>
                          <p className="text-xs text-gray-600">{t.serviceLabel} {d.service} | {t.amountLabel} <strong className="text-red-600">{d.amount} {t.currency}</strong></p>
                          <span className="text-[10px] text-gray-400">{t.debtDateLabel} {d.date}</span>
                        </div>

                        {settlingDebtId === d.id ? (
                          <div className="bg-white p-3 rounded-xl border shadow-sm space-y-2 w-full md:w-auto">
                            <span className="text-xs font-bold text-emerald-700 block">{t.chooseSettleMethodAndDate}</span>
                            <div className="flex gap-2">
                              <button type="button" onClick={() => setRepayMethod('كاش')} className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${repayMethod === 'كاش' ? 'bg-emerald-600 text-white' : 'bg-gray-100'}`}>{t.cash}</button>
                              <button type="button" onClick={() => setRepayMethod('بنك')} className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${repayMethod === 'بنك' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>{t.bank}</button>
                            </div>
                            <input type="date" value={repayDate} onChange={e => setRepayDate(e.target.value)} className="w-full px-2 py-1 border rounded-lg text-xs text-gray-900" />
                            <input type="text" placeholder={t.notesPlaceholder} value={repayNotes} onChange={e => setRepayNotes(e.target.value)} className="w-full px-2 py-1 border rounded-lg text-xs text-gray-900" />
                            <div className="flex gap-2 pt-1">
                              <button onClick={() => handleSettleDebtAction(shopId, d)} className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold">{t.confirmSettle}</button>
                              <button onClick={() => setSettlingDebtId(null)} className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold">{t.cancel}</button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => setSettlingDebtId(d.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1 shadow-xs">
                            <CheckSquare size={14} /> {t.settleDebtBtn}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
                <div className="flex justify-between items-center border-b pb-3 flex-wrap gap-3">
                  <h3 className="font-bold text-gray-800">
                    {selectedDateFilter ? `${t.vehiclesOfDate} ${selectedDateFilter}` : t.oldRecords} 
                    <span className="text-xs text-purple-600 font-semibold mx-2">({filteredWorkerTx.length} {t.resultsCount})</span>
                  </h3>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    <input 
                      type="text" 
                      placeholder={t.searchPlatePlaceholder} 
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
                      {isRefreshing ? t.refreshing : t.refreshData}
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {filteredWorkerTx.length === 0 ? (
                    <p className="text-xs text-gray-400 py-4 text-center">{t.noTransactionsFound}</p>
                  ) : (
                    filteredWorkerTx.map(tItem => (
                      <div key={tItem.id} className="p-4 bg-gray-50 rounded-2xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold block text-base text-gray-900">🏪 {currentUser.shopName}</span>
                            <span className="text-[11px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-mono font-bold">{t.dateLabel} {tItem.date || t.unspecified}</span>
                          </div>
                          <span className="text-sm font-semibold text-blue-600">[{tItem.vehicleCategory}] {tItem.carModel} | {t.plateNumber} {tItem.plate}</span>
                          <p className="text-xs text-gray-600">{tItem.service} | {t.paymentMethod}: {tItem.method === 'دين' ? t.debt : tItem.method}</p>
                          {tItem.notes && <p className="text-xs text-amber-700 italic">{t.notesOptional}: {tItem.notes}</p>}
                          <span className="text-xs font-bold text-emerald-600">{t.inputAmount} {tItem.price} {t.currency} {tItem.method === 'دين' && t.onCreditBadge}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {tItem.beforePhoto && <img src={tItem.beforePhoto} alt={t.beforeBadge} className="w-12 h-12 object-cover rounded-lg border" />}
                          {tItem.afterPhoto && <img src={tItem.afterPhoto} alt={t.afterBadge} className="w-12 h-12 object-cover rounded-lg border" />}
                          
                          <button onClick={() => handleStartEditTransaction(tItem)} className="bg-blue-100 text-blue-700 px-2.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1"><Edit3 size={13} /> {t.edit}</button>
                          <button onClick={() => setSelectedInvoice({ ...tItem, shopName: currentUser.shopName, shopInfo: currentUser.shopInfo || { name: currentUser.shopName, address: 'فرع الخدمة', phone: '+90...' } })} className="bg-slate-800 text-white px-3 py-2 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1 hover:bg-black"><Printer size={14} /> {t.printInvoiceBtn}</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ================= لوحة صاحب المحل =================
  const ownedShops = currentUser.ownedShops || [];
  const currentShop = ownedShops.find(s => s.id === Number(selectedShopId)) || ownedShops[0];
  const isAllShops = selectedShopId === 'all';
  const targetShopIds = isAllShops ? ownedShops.map(s => s.id) : [Number(selectedShopId)];

  const calculateDaysRemaining = (expiryDateStr) => {
    if (!expiryDateStr || expiryDateStr.includes('مدى الحياة') || expiryDateStr.includes('Ömür') || expiryDateStr.includes('Lifetime')) return 999;
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
    <div className="min-h-screen bg-slate-100 font-sans" dir={t.dir}>
      {renderToastComponent()}
      {renderConfirmModal()}

      {!isAllShops && currentShop && daysLeft <= 3 && daysLeft >= 0 && (
        <div className="bg-amber-500 text-slate-900 px-4 py-2.5 text-center font-black text-xs md:text-sm shadow-md flex items-center justify-center gap-2">
          <AlertTriangle size={18} />
          <span>{t.expiringSoonWarning.replace('{name}', currentShop.name).replace('{days}', daysLeft)}</span>
        </div>
      )}
      {!isAllShops && currentShop && daysLeft < 0 && (
        <div className="bg-red-600 text-white px-4 py-2.5 text-center font-black text-xs md:text-sm shadow-md flex items-center justify-center gap-2">
          <AlertTriangle size={18} />
          <span>{t.expiredWarning}</span>
        </div>
      )}

      {/* الهيدر العلوي المحدث بأعلى معايير الفخامة والعصرية */}
      <header className="bg-slate-950 border-b border-slate-800 text-white px-6 py-4 shadow-2xl flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
            <Building size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-extrabold text-white text-base tracking-wide">{t.ownerDashboard} {currentUser.ownerName}</span>
              <span className="text-[10px] bg-slate-800 text-blue-400 px-2.5 py-0.5 rounded-full font-mono border border-slate-700">{t.taxNumberLabel} {currentUser.taxNumber}</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{t.manageShopsSub}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <select 
              value={selectedShopId || ''} 
              onChange={e => setSelectedShopId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-xs font-bold border border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer shadow-inner"
            >
              {ownedShops.map(s => <option key={s.id} value={s.id}>🏪 {s.name} {s.status === 'suspended' ? '(معلق/منتهي)' : ''}</option>)}
              <option value="all">{t.combinedReportOption.replace('{count}', ownedShops.length)}</option>
            </select>
          </div>
          
          {renderLanguageSwitcher('dark')}

          <button 
            onClick={handleLogout} 
            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 hover:border-red-500/50 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 transition shadow-sm"
          >
            <LogOut size={15} /> {t.logout}
          </button>
        </div>
      </header>

      {/* شريط التنقل الاحترافي */}
      <nav className="bg-white border-b border-slate-200 px-6 py-3 flex gap-3 text-xs md:text-sm font-bold shadow-xs overflow-x-auto">
        <button 
          onClick={() => setActiveTab('dashboard')} 
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap shadow-xs ${activeTab === 'dashboard' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/25' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          {t.overviewTab}
        </button>
        <button 
          onClick={() => setActiveTab('addShop')} 
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap shadow-xs ${activeTab === 'addShop' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/25' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          {t.manageBranchesTab}
        </button>
        {!isAllShops && (
          <button 
            onClick={() => setActiveTab('accounting')} 
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap shadow-xs ${activeTab === 'accounting' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/25' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            {t.accountingTab}
          </button>
        )}
        <button 
          onClick={() => setActiveTab('profile')} 
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap shadow-xs ${activeTab === 'profile' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/25' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          {t.profileTab}
        </button>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white p-6 rounded-3xl shadow-lg flex flex-wrap justify-between items-center gap-4">
              <div>
                <span className="text-blue-300 text-xs font-bold uppercase tracking-wider">{t.currentActiveBranch}</span>
                <h2 className="text-2xl font-black text-white mt-1">{isAllShops ? t.combinedAllShopsTitle.replace('{count}', ownedShops.length) : currentShop?.name}</h2>
                <p className="text-xs text-gray-300 mt-1">📍 {isAllShops ? t.activeBranchesOutOfTotal.replace('{active}', activeShopsCount).replace('{total}', ownedShops.length) : currentShop?.address}</p>
                {currentShop?.status === 'suspended' && (
                  <span className="inline-block mt-2 px-3 py-1 bg-red-500 text-white text-xs rounded-full font-bold">{t.shopSuspendedRenewNotice}</span>
                )}
                
                {/* عداد الوقت المتبقي للباقة */}
                {currentShop && (
                  <div className="mt-3 inline-flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl backdrop-blur-md text-xs font-bold border border-white/15 shadow-inner">
                    <span>{t.packageCounterLabel}</span>
                    <span className="text-emerald-400 font-mono text-sm">
                      {calculateTimeRemaining(currentShop.subscriptionExpiry)}
                    </span>
                  </div>
                )}
              </div>
              <div className="text-start bg-white/10 p-4 rounded-2xl backdrop-blur-md shadow-inner border border-white/10">
                <span className="text-xs text-blue-200 block font-bold">{t.totalNetProfit}</span>
                <span className="text-3xl font-black text-emerald-400">{netProfit} {t.currency}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-100">
                <span className="text-gray-500 text-sm">{t.cashBox}</span>
                <h3 className="text-2xl font-black text-emerald-600 mt-1">{totalCashAll} {t.currency}</h3>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-blue-100">
                <span className="text-gray-500 text-sm">{t.bankAccount}</span>
                <h3 className="text-2xl font-black text-blue-600 mt-1">{totalBankAll} {t.currency}</h3>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-amber-100">
                <span className="text-gray-500 text-sm">{t.totalPendingDebts}</span>
                <h3 className="text-2xl font-black text-amber-600 mt-1">{totalDebtsAll} {t.currency}</h3>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-red-100">
                <span className="text-gray-500 text-sm">{t.totalExpensesStat}</span>
                <h3 className="text-2xl font-black text-red-600 mt-1">{totalExpensesAll} {t.currency}</h3>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-purple-100">
                <span className="text-gray-500 text-sm">{t.washedVehiclesStat}</span>
                <h3 className="text-2xl font-black text-purple-600 mt-1">{totalVehiclesAll}</h3>
              </div>
            </div>

            {!isAllShops && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Bell className="text-amber-600" size={18} /> {t.workerAnnouncementsTitle} {currentShop?.name}
                </h3>
                
                <form onSubmit={handleAddAnnouncement} className="space-y-3 bg-gray-50 p-4 rounded-xl border">
                  <span className="text-xs font-bold text-gray-700 block">{t.sendNewWorkerAlert}</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input 
                      type="text" 
                      placeholder={t.alertTitlePlaceholder} 
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
                    placeholder={t.alertTextPlaceholder} 
                    value={ownerNoticeText} 
                    onChange={e => setOwnerNoticeText(e.target.value)} 
                    onInvalid={e => e.target.setCustomValidity('يرجى كتابة نص التنبيه')}
                    onInput={e => e.target.setCustomValidity('')}
                    className="w-full px-3 py-2 border rounded-xl text-sm h-16 resize-none text-gray-900 bg-white" 
                    required
                  />
                  <div className="flex justify-end">
                    <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs cursor-pointer shadow-sm">
                      {t.publishAlertBtn}
                    </button>
                  </div>
                </form>

                <div className="space-y-2 pt-2">
                  <h4 className="font-bold text-xs text-gray-700">{t.activeAlertsForShop}</h4>
                  {shopAnnouncementsList.length === 0 ? (
                    <p className="text-xs text-gray-400">{t.noActiveAlerts}</p>
                  ) : (
                    <div className="space-y-2">
                      {shopAnnouncementsList.map(ann => (
                        <div key={ann.id} className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex justify-between items-center text-sm">
                          <div>
                            <span className="font-bold text-gray-900">{ann.title}</span>
                            <p className="text-xs text-gray-700 mt-0.5">{ann.text}</p>
                            <span className="text-[10px] text-gray-400 block mt-1">{t.publishDate} {ann.date}</span>
                          </div>
                          <button 
                            onClick={() => handleDeleteAnnouncement(selectedShopId, ann.id)}
                            className="bg-red-100 text-red-700 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1 hover:bg-red-200 shadow-xs"
                          >
                            <Trash2 size={13} /> {t.delete}
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
                  <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">{t.combinedDebtsSheetTitle}</h3>
                  <button 
                    onClick={handleRefreshData} 
                    disabled={isRefreshing}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition border"
                  >
                    <RefreshCw size={14} className={isRefreshing ? "animate-spin text-blue-600" : ""} /> 
                    {isRefreshing ? t.refreshing : t.updateLists}
                  </button>
                </div>
                {allShopsDebtsList.length === 0 ? (
                  <p className="text-xs text-gray-400">{t.noDebtsAllShops}</p>
                ) : (
                  <div className="space-y-2">
                    {allShopsDebtsList.map(d => (
                      <div key={d.id} className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex justify-between items-center text-sm">
                        <div>
                          <span className="font-bold text-gray-900">🏪 {d.shopName} | {t.customerLabel} {d.debtorName}</span>
                          <p className="text-xs text-gray-600">{t.phoneLabel} <span dir="ltr">{d.phone}</span> | {t.serviceLabel} {d.service} ({t.dateLabel} {d.date})</p>
                        </div>
                        <span className="font-black text-red-600 text-base">{d.amount} {t.currency}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!isAllShops && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2"><Tag className="text-red-600" size={18} /> {t.recordExpenseFor} {currentShop?.name}</h3>
                  <form onSubmit={handleAddExpense} className="space-y-3">
                    <select value={expCategory} onChange={e => setExpCategory(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm bg-white text-gray-900">
                      {t.expCategories.map((c, i) => (
                        <option key={i} value={c}>{c}</option>
                      ))}
                    </select>
                    <input type="text" placeholder={t.expTitlePlaceholder} value={expTitle} onChange={e => setExpTitle(e.target.value)} onInvalid={e => e.target.setCustomValidity('يرجى إدخال عنوان المصروف')} onInput={e => e.target.setCustomValidity('')} className="w-full px-3 py-2 border rounded-xl text-sm text-gray-900" required />
                    <input type="number" placeholder={t.expAmountPlaceholder} value={expAmount} onChange={e => setExpAmount(e.target.value)} onInvalid={e => e.target.setCustomValidity('يرجى إدخال مبلغ المصروف')} onInput={e => e.target.setCustomValidity('')} className="w-full px-3 py-2 border rounded-xl text-sm text-gray-900" required />
                    <textarea placeholder={t.expNotesPlaceholder} value={expNotes} onChange={e => setExpNotes(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm h-16 resize-none text-gray-900" />
                    <button type="submit" className="w-full bg-red-600 text-white py-2.5 rounded-xl text-sm font-bold cursor-pointer">{t.deductAndSaveExp}</button>
                  </form>
                </div>

                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border space-y-4">
                  <div className="flex justify-between items-center border-b pb-3 flex-wrap gap-3">
                    <h3 className="font-bold text-gray-900">
                      {selectedDateFilter ? `${t.vehicleMovementDate} ${selectedDateFilter}` : t.oldRecords}
                      <span className="text-xs text-blue-600 font-semibold mx-2">({filteredOwnerTx.length} {t.resultsCount})</span>
                    </h3>

                    <div className="flex items-center gap-2 flex-wrap">
                      <input 
                        type="text" 
                        placeholder={t.searchPlatePlaceholder} 
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
                        {isRefreshing ? t.refreshing : t.refreshData}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {filteredOwnerTx.length === 0 ? (
                      <p className="text-xs text-gray-400 py-4 text-center">{t.noVehiclesMatched}</p>
                    ) : (
                      filteredOwnerTx.map(tItem => (
                        <div key={tItem.id} className="p-3 bg-gray-50 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold block text-gray-900">🏪 {currentShop.name}</span>
                              <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-mono font-bold">{t.dateLabel} {tItem.date || t.unspecified}</span>
                            </div>
                            <span className="font-bold text-blue-600">[{tItem.vehicleCategory}] {tItem.carModel} | {t.plateNumber} {tItem.plate}</span> - {tItem.service}
                            <span className="block text-xs text-gray-500">{t.registeredAmount} {tItem.price} {t.currency} | {t.statusLabel} {tItem.method === 'دين' ? t.debt : tItem.method} {tItem.notes && `| ${t.notesOptional}: ${tItem.notes}`}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleDeleteTransactionByOwner(selectedShopId, tItem.id)} className="bg-red-100 text-red-700 px-2.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1"><Trash2 size={13} /> {t.adminDelete}</button>
                            <button onClick={() => setSelectedInvoice({ ...tItem, shopName: currentShop.name, shopInfo: currentShop })} className="bg-slate-800 text-white px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1 hover:bg-black"><Printer size={14} /> {t.printInvoiceBtn}</button>
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
                      {editingShopId ? t.editShopTitle : t.addNewShopTitle}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {editingShopId ? t.editShopSub : t.addNewShopSub}
                    </p>
                  </div>
                </div>
                {editingShopId && (
                  <button 
                    type="button" 
                    onClick={() => { setEditingShopId(null); setNewShopName(''); setNewWorkerEmail(''); setNewWorkerPass(''); setNewShopPhone(''); setNewShopAddress(''); }}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-bold transition"
                  >
                    {t.cancelEdit}
                  </button>
                )}
              </div>

              <form onSubmit={handleOwnerSaveShop} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">{t.newShopNameLabel}</label>
                  <input 
                    type="text" 
                    placeholder={t.shopNamePlaceholder} 
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
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">{t.workerEmailLabel}</label>
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
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">{t.workerPassLabel}</label>
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
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">{t.shopPhoneLabel}</label>
                    <input 
                      type="text" 
                      dir="ltr"
                      maxLength={11}
                      placeholder="05XXXXXXXXX" 
                      value={newShopPhone} 
                      onChange={e => setNewShopPhone(e.target.value.replace(/\D/g, '').slice(0, 11))} 
                      className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm text-gray-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition font-semibold text-start" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">{t.shopAddressLabel}</label>
                    <input 
                      type="text" 
                      placeholder={t.shopAddressPlaceholder} 
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
                  {editingShopId ? t.saveShopEditBtn : t.addNewShopBtn}
                </button>
              </form>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 space-y-5">
              <div className="flex justify-between items-center border-b pb-4">
                <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                  <span>🏢</span> {t.registeredBranchesTitle} ({ownedShops.length}):
                </h3>
                <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold">
                  {t.comprehensiveManageBadge}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {ownedShops.map(s => (
                  <div key={s.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white transition shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-3">
                        <h4 className="font-black text-base text-slate-900">🏪 {s.name}</h4>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${s.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {s.status === 'active' ? t.activeBadge : t.suspendedBadge2}
                        </span>
                        <span className="text-[11px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold">
                          {t.packageLabel} {s.subscriptionType}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 flex items-center gap-1.5">
                        <MapPin size={13} className="text-red-500" /> {t.branchAddress}: {s.address} | <Phone size={13} className="text-blue-500" /> {t.phoneLabel} <span dir="ltr">{s.phone}</span>
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1.5">
                        <Mail size={13} className="text-purple-500" /> {t.workerEmailDisplay} <strong className="text-slate-800 font-mono">{s.workerEmail}</strong>
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
              <p className="text-xs text-gray-600">{t.financialStatementTitle} | {currentShop?.address} | {t.phoneLabel} <span dir="ltr">{currentShop?.phone}</span></p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200">
                <span className="text-xs text-blue-900 block font-bold">{t.totalServices}</span>
                <span className="text-lg font-black text-blue-700">{shopTotalServices} {t.currency}</span>
              </div>
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
                <span className="text-xs text-emerald-900 block font-bold">{t.totalCollected}</span>
                <span className="text-lg font-black text-emerald-700">{shopTotalPaid} {t.currency}</span>
              </div>
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
                <span className="text-xs text-amber-900 block font-bold">{t.totalPendingDebts}</span>
                <span className="text-lg font-black text-amber-700">{shopTotalDebtAmount} {t.currency}</span>
              </div>
              <div className="bg-red-50 p-4 rounded-2xl border border-red-200">
                <span className="text-xs text-red-900 block font-bold">{t.totalExpensesStat}</span>
                <span className="text-lg font-black text-red-700">{shopTotalExpenses} {t.currency}</span>
              </div>
              <div className="bg-purple-50 p-4 rounded-2xl border border-purple-200 md:col-span-1 col-span-2">
                <span className="text-xs text-purple-900 block font-bold">{t.netProfitLabel}</span>
                <span className="text-lg font-black text-purple-700">{shopNetProfit} {t.currency}</span>
              </div>
            </div>

            <div className="space-y-3 bg-amber-50 p-5 rounded-2xl border border-amber-200">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-amber-900 text-base flex items-center gap-2">{t.customerDebtsRecord}</h4>
                <button 
                  onClick={handleRefreshData} 
                  disabled={isRefreshing}
                  className="bg-white hover:bg-amber-100 text-amber-800 px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition border border-amber-300"
                >
                  <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} /> {t.updateLists}
                </button>
              </div>

              {currentShopDebts.length === 0 ? (
                <p className="text-xs text-gray-600">{t.noDebtsForCurrentShop}</p>
              ) : (
                <div className="space-y-2">
                  {currentShopDebts.map(d => (
                    <div key={d.id} className="p-3 bg-white rounded-xl shadow-xs flex justify-between items-center text-sm border border-amber-100">
                      <div>
                        <span className="font-bold text-gray-900">{t.customerLabel} {d.debtorName}</span>
                        <p className="text-xs text-gray-700">{t.phoneLabel} <span dir="ltr">{d.phone}</span> | {t.serviceLabel} {d.service}</p>
                        <span className="text-[10px] text-gray-500">{t.dateLabel} {d.date} ({t.addedBy} {d.addedBy})</span>
                      </div>
                      <span className="text-base font-black text-red-600">{d.amount} {t.currency}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-gray-900 border-b pb-2">{t.expensesDetails}</h4>
              {currentShopExpenses.length === 0 ? <p className="text-xs text-gray-500">{t.noExpensesForShop}</p> : currentShopExpenses.map(e => (
                <div key={e.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded-lg">
                  <span className="text-gray-900 font-medium">{e.title} ({e.category})</span>
                  <span className="text-red-600 font-bold">-{e.amount} {t.currency}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 flex justify-end">
              <button onClick={() => handlePrintInvoice({ shopName: currentShop.name, shopInfo: currentShop, plate: 'كشف حساب مالي شامل', type: 'جميع العمليات', service: 'تقرير الحسابات والديون والأرباح', startTime: '-', endTime: '-', method: 'تقرير', price: shopNetProfit })} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm cursor-pointer flex items-center gap-2 hover:bg-black"><Printer size={16} /> {t.printFinancialPdf}</button>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-white p-8 rounded-3xl shadow-sm border max-w-xl mx-auto space-y-4">
            <h3 className="text-xl font-bold text-gray-900">{t.profileAndTaxTitle}</h3>
            <form onSubmit={e => { e.preventDefault(); showToast('تم تحديث البيانات بنجاح!', 'success'); }} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t.ownerOrgName}</label>
                <input type="text" defaultValue={currentUser.ownerName} className="w-full px-3 py-2 border rounded-xl text-sm text-gray-900 font-semibold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t.email}</label>
                <input type="email" defaultValue={currentUser.email} className="w-full px-3 py-2 border rounded-xl text-sm text-gray-900 font-semibold" disabled />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t.taxNumberOrg}</label>
                <input type="text" defaultValue={currentUser.taxNumber} onChange={e => currentUser.taxNumber = e.target.value} className="w-full px-3 py-2 border rounded-xl text-sm text-gray-900 font-semibold" placeholder={t.taxNumberPlaceholder} />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-sm cursor-pointer">{t.saveProfileBtn}</button>
            </form>
          </div>
        )}
      </main>

      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-lg w-full space-y-6 relative" dir={t.dir}>
            <div className="space-y-4 text-start">
              <div className="text-center border-b pb-3">
                <h2 className="text-xl font-black text-gray-900">🏪 {selectedInvoice.shopName}</h2>
                <p className="text-xs text-gray-600">{selectedInvoice.shopInfo?.address || 'İskenderun'} | {t.phoneLabel} <span dir="ltr">{selectedInvoice.shopInfo?.phone || '+90...'}</span></p>
                <span className="inline-block mt-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold">{t.officialInvoiceBadge}</span>
              </div>
              <div className="space-y-2 text-sm text-gray-800 font-medium">
                <div className="flex justify-between border-b pb-1"><span className="text-gray-600">{t.vehicleCatLabel}</span><span className="font-bold text-gray-900">{selectedInvoice.vehicleCategory} ({selectedInvoice.vehicleCategory === 'سيارة' ? selectedInvoice.carModel : t.motorcycle})</span></div>
                <div className="flex justify-between border-b pb-1"><span className="text-gray-600">{t.plateNumber}:</span><span className="font-bold text-gray-900">{selectedInvoice.plate}</span></div>
                <div className="flex justify-between border-b pb-1"><span className="text-gray-600">{t.serviceNameLabel}:</span><span className="font-bold text-gray-900">{selectedInvoice.service}</span></div>
                <div className="flex justify-between border-b pb-1"><span className="text-gray-600">{t.paymentMethod}:</span><span className="font-bold text-gray-900">{selectedInvoice.method === 'دين' ? t.onCreditBadge : selectedInvoice.method}</span></div>
                
                {selectedInvoice.notes && (
                  <div className="flex justify-between border-b pb-1"><span className="text-gray-600">{t.notesOptional}:</span><span className="font-bold text-amber-700">{selectedInvoice.notes}</span></div>
                )}

                {(selectedInvoice.beforePhoto || selectedInvoice.afterPhoto) && (
                  <div className="py-2 border-b">
                    <span className="text-xs text-gray-600 block mb-2 font-bold">{t.photoDocumentation}:</span>
                    <div className="flex justify-around gap-2">
                      {selectedInvoice.beforePhoto && (
                        <div className="text-center w-1/2">
                          <span className="text-[10px] text-gray-500 block">{t.beforeBadge}</span>
                          <img src={selectedInvoice.beforePhoto} alt={t.beforeBadge} className="w-full h-20 object-cover rounded-lg border mt-1" />
                        </div>
                      )}
                      {selectedInvoice.afterPhoto && (
                        <div className="text-center w-1/2">
                          <span className="text-[10px] text-gray-500 block">{t.afterBadge}</span>
                          <img src={selectedInvoice.afterPhoto} alt={t.afterBadge} className="w-full h-20 object-cover rounded-lg border mt-1" />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-between text-base font-black bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                  <span className="text-emerald-900">{t.totalInvoiceAmount}</span><span className="text-emerald-700">{selectedInvoice.price} {t.currency}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => handlePrintInvoice(selectedInvoice)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer text-sm shadow-md">
                <Printer size={18} /> {t.printPdfBtn}
              </button>
              <button onClick={() => setSelectedInvoice(null)} className="px-5 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-bold cursor-pointer text-sm">
                {t.closeBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}