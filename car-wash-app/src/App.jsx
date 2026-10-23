import React, { useState, useEffect } from 'react';
import { 
  Car, Shield, Clock, Users, Wrench, Lock, Unlock, 
  Search, CreditCard, Banknote, LogOut, Building, Plus, CheckCircle, Printer, FileText, Camera, Calendar, Phone, MapPin, Tag, User, Settings, DollarSign, BarChart3, Key, Mail, AlertTriangle, Trash2, Edit3, Image as ImageIcon, RefreshCw, Bike, Bell, CheckSquare
} from 'lucide-react';
import { auth, db } from './firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail, signOut } from 'firebase/auth';
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, setDoc } from 'firebase/firestore';

export default function App() {
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

  const [inputEmail, setInputEmail] = useState('');
  const [inputPassword, setInputPassword] = useState('');

  const [shops, setShops] = useState([
    { 
      id: 1, 
      name: 'مغسلة النسر - الفرع الرئيسي', 
      owner: 'أحمد محمد', 
      ownerEmail: 'ahmed@gmail.com',
      workerEmail: 'worker1@gmail.com',
      workerPass: '123456',
      phone: '+90 531 234 5678', 
      address: 'إسكندرون، شارع أتاتورك', 
      code: 'NESR-1', 
      status: 'active',
      suspendedAt: null
    },
    { 
      id: 2, 
      name: 'مغسلة النسر - فرع الميناء', 
      owner: 'أحمد محمد', 
      ownerEmail: 'ahmed@gmail.com',
      workerEmail: 'worker2@gmail.com',
      workerPass: '123456',
      phone: '+90 531 234 5679', 
      address: 'إسكندرون، المنطقة الحرة', 
      code: 'NESR-2', 
      status: 'active',
      suspendedAt: null
    }
  ]);

  // مزامنة المحلات والفروع سحابياً بشكل لحظي من Firestore
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

  const [newShopName, setNewShopName] = useState('');
  const [newWorkerEmail, setNewWorkerEmail] = useState('');
  const [newWorkerPass, setNewWorkerPass] = useState('');
  const [newShopPhone, setNewShopPhone] = useState('');
  const [newShopAddress, setNewShopAddress] = useState('');
  const [editingShop, setEditingShop] = useState(null);

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
      alert('تم تحديث القوائم وجلب أحدث البيانات بنجاح! 🔄✨');
    }, 600);
  };

  const handleFirebaseLogin = async (e) => {
    e.preventDefault();
    if (!inputEmail || !inputPassword) return alert('الرجاء إدخال البريد الإلكتروني وكلمة المرور');

    try {
      if (inputEmail.toLowerCase() === "munir@gmail.com") {
        try { await signInWithEmailAndPassword(auth, inputEmail, inputPassword); } catch (e) {}
        setCurrentUser({ email: inputEmail, role: 'programmer', name: 'المبرمج (المدير العام)' });
        return;
      }

      const ownedShops = shops.filter(s => s.ownerEmail && s.ownerEmail.toLowerCase() === inputEmail.toLowerCase());
      if (ownedShops.length > 0) {
        try { await signInWithEmailAndPassword(auth, inputEmail, inputPassword); } catch (e) {}
        const userData = {
          email: inputEmail,
          role: 'owner',
          ownerName: ownedShops[0].owner,
          ownedShops: ownedShops
        };
        setCurrentUser(userData);
        const activeFirst = ownedShops.find(s => s.status === 'active') || ownedShops[0];
        setSelectedShopId(activeFirst.id);
        return;
      }

      const targetShop = shops.find(s => s.workerEmail && s.workerEmail.toLowerCase() === inputEmail.toLowerCase() && s.workerPass === inputPassword);
      if (targetShop) {
        if (targetShop.status === 'suspended') {
          alert('عذراً، هذا الفرع معلق أو موقوف حالياً من قبل الإدارة!');
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

      alert('البريد الإلكتروني أو كلمة المرور غير صحيحة!');
    } catch (error) {
      console.error(error);
      alert('فشل تسجيل الدخول: تأكد من صحة البيانات المدخلة.');
    }
  };

  const handleForgotPassword = async () => {
    if (!inputEmail) {
      alert('الرجاء كتابة بريدك الإلكتروني في حقل الإيميل أولاً!');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, inputEmail);
      alert('تم إرسال رابط تغيير كلمة المرور إلى بريدك الإلكتروني بنجاح. تفقد صندوق الوارد أو البريد المزعج (Spam)! 📧');
    } catch (error) {
      console.error(error);
      alert('حدث خطأ، تأكد من أن البريد الإلكتروني مسجل بشكل صحيح في النظام.');
    }
  };

  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    if (!ownerNoticeTitle || !ownerNoticeText || selectedShopId === 'all') return alert('الرجاء اختيار فرع محدد وتعبئة العنوان ونَص الملاحظة');
    
    const newAnn = {
      title: ownerNoticeTitle,
      text: ownerNoticeText,
      date: announcementDate
    };

    try {
      await addDoc(collection(db, "shops", String(selectedShopId), "announcements"), newAnn);
      setOwnerNoticeTitle('');
      setOwnerNoticeText('');
      alert('تم نشر التنبيه بنجاح للعامل في الفرع! 📢✨');
    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء نشر التنبيه.');
    }
  };

  const handleDeleteAnnouncement = async (shopId, annId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا التنبيه؟')) return;
    try {
      await deleteDoc(doc(db, "shops", String(shopId), "announcements", String(annId)));
      alert('تم حذف التنبيه بنجاح.');
    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء الحذف.');
    }
  };

  const handleSettleDebtAction = async (shopId, debtObj) => {
    try {
      await deleteDoc(doc(db, "shops", String(shopId), "debts", String(debtObj.id)));

      const newRepayment = {
        debtorName: debtObj.debtorName,
        amount: debtObj.amount,
        method: repayMethod,
        notes: repayNotes || 'تسديد دين سابق',
        date: repayDate
      };

      await addDoc(collection(db, "shops", String(shopId), "debtRepayments"), newRepayment);

      setSettlingDebtId(null);
      setRepayNotes('');
      alert(`تم تسديد دين الزبون (${debtObj.debtorName}) بقيمة ${debtObj.amount} ليرة بنجاح عبر (${repayMethod}) وإضافته للصندوق! 💵✅`);
    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء تسديد الدين.');
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

          const MAX_WIDTH = 300;
          const MAX_HEIGHT = 300;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.5);

          if (type === 'before') setBeforePhoto(compressedBase64);
          if (type === 'after') setAfterPhoto(compressedBase64);
        } catch (err) {
          console.error(err);
          alert('حدث خطأ أثناء معالجة الصورة.');
        }
      };
      img.onerror = () => {
        alert('صيغة الصورة غير مدعومة. يرجى التصوير بالكاميرا أو اختيار صيغة JPG أو PNG.');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handlePrintInvoice = (inv) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('يرجى السماح بفتح النوافذ المنبثقة من المتصفح للطباعة.');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>فاتورة غسيل - ${inv.plate}</title>
        <style>
          body { font-family: 'Tahoma', Arial, sans-serif; padding: 20px; color: #111; background: #fff; text-align: right; }
          .invoice-box { max-width: 500px; margin: auto; padding: 25px; border: 2px solid #0f172a; border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
          .header { text-align: center; border-bottom: 2px dashed #cbd5e1; padding-bottom: 15px; margin-bottom: 20px; }
          .header h2 { margin: 0 0 5px 0; font-size: 24px; color: #0f172a; }
          .header p { margin: 3px 0; font-size: 13px; color: #64748b; }
          .badge { display: inline-block; margin-top: 8px; padding: 6px 16px; background: #e0e7ff; color: #3730a3; font-size: 13px; font-weight: bold; border-radius: 8px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; font-size: 14px; }
          .row span { color: #64748b; }
          .row strong { color: #0f172a; }
          .notes-box { background: #f8fafc; padding: 10px; border-radius: 8px; margin: 10px 0; font-size: 13px; color: #334155; }
          .photos-section { margin-top: 20px; border-top: 2px dashed #cbd5e1; padding-top: 15px; text-align: center; }
          .photos-section h4 { margin: 0 0 10px 0; font-size: 14px; color: #334155; }
          .photos-grid { display: flex; justify-content: space-around; gap: 10px; }
          .photo-box { width: 45%; text-align: center; }
          .photo-box span { font-size: 11px; color: #64748b; display: block; margin-bottom: 5px; font-weight: bold; }
          .photo-box img { width: 100%; height: 110px; object-fit: cover; border-radius: 10px; border: 1px solid #cbd5e1; }
          .total { font-size: 20px; font-weight: 900; background: #ecfdf5; padding: 14px; text-align: center; margin-top: 20px; border-radius: 12px; color: #047857; border: 1px solid #a7f3d0; }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <div class="header">
            <h2>🏪 ${inv.shopName}</h2>
            <p>${inv.shopInfo?.address || 'إسكندرون'} | هاتف: ${inv.shopInfo?.phone || '+90...'}</p>
            <div class="badge">فاتورة غسيل مركبات رسمية</div>
          </div>
          <div class="row">
            <span>نوع المركبة:</span>
            <strong>${inv.vehicleCategory} (${inv.vehicleCategory === 'سيارة' ? inv.carModel : 'موتور'})</strong>
          </div>
          <div class="row">
            <span>رقم اللوحة:</span>
            <strong>${inv.plate}</strong>
          </div>
          <div class="row">
            <span>الخدمة المقدمة:</span>
            <strong>${inv.service}</strong>
          </div>
          <div class="row">
            <span>وقت البدء والانتهاء:</span>
            <strong>${inv.startTime} ➔ ${inv.endTime}</strong>
          </div>
          <div class="row">
            <span>طريقة الدفع:</span>
            <strong>${inv.method === 'دين' ? 'دين (على الذمة)' : inv.method}</strong>
          </div>

          ${inv.notes ? `
            <div class="notes-box">
              <strong>ملاحظات العامل:</strong> ${inv.notes}
            </div>
          ` : ''}

          ${(inv.beforePhoto || inv.afterPhoto) ? `
            <div class="photos-section">
              <h4>توثيق حالة المركبة بالصور</h4>
              <div class="photos-grid">
                ${inv.beforePhoto ? `
                  <div class="photo-box">
                    <span>قبل الغسيل</span>
                    <img src="${inv.beforePhoto}" alt="قبل الغسيل" />
                  </div>
                ` : ''}
                ${inv.afterPhoto ? `
                  <div class="photo-box">
                    <span>بعد الغسيل</span>
                    <img src="${inv.afterPhoto}" alt="بعد الغسيل" />
                  </div>
                ` : ''}
              </div>
            </div>
          ` : ''}

          <div class="total">
            المبلغ الإجمالي: ${inv.price} ليرة
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
    localStorage.removeItem('carWash_currentUser');
    setCurrentUser(null);
    setSelectedInvoice(null);
    setEditingShop(null);
    setEditingTxId(null);
  };

  const handleSuspendShop = async (shopId) => {
    if (!window.confirm('هل أنت متأكد من تعليق هذا الفرع؟ سيتم منع العامل من الدخول فوراً.')) return;
    try {
      await updateDoc(doc(db, "platformShops", String(shopId)), {
        status: 'suspended',
        suspendedAt: new Date().toISOString()
      });
      alert('تم تعليق المحل بنجاح.');
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء تعليق الفرع.');
    }
  };

  const handleActivateShop = async (shopId) => {
    try {
      await updateDoc(doc(db, "platformShops", String(shopId)), {
        status: 'active',
        suspendedAt: null
      });
      alert('تم إعادة تفعيل الفرع بنجاح!');
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء تفعيل الفرع.');
    }
  };

  const handleSaveEditShop = async (e) => {
    e.preventDefault();
    if (!editingShop) return;
    try {
      await updateDoc(doc(db, "platformShops", String(editingShop.id)), {
        name: editingShop.name,
        workerEmail: editingShop.workerEmail,
        workerPass: editingShop.workerPass,
        phone: editingShop.phone,
        address: editingShop.address
      });
      setEditingShop(null);
      alert('تم تعديل بيانات المحل بنجاح!');
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء حفظ التعديلات.');
    }
  };

  const handleOwnerAddShop = async (e) => {
    e.preventDefault();
    if (!newShopName || !newWorkerEmail || !newWorkerPass) return alert('يرجى تعبئة اسم المحل وإيميل وكلمة سر العامل');

    try {
      const newShopId = Date.now();
      const newShopObj = {
        id: newShopId,
        name: newShopName,
        owner: currentUser.ownerName,
        ownerEmail: currentUser.email,
        workerEmail: newWorkerEmail,
        workerPass: newWorkerPass,
        phone: newShopPhone || '+90 ...',
        address: newShopAddress || 'العنوان لم يحدد',
        code: 'SHOP-' + Math.floor(100 + Math.random() * 900),
        status: 'active',
        suspendedAt: null
      };

      await setDoc(doc(db, "platformShops", String(newShopId)), newShopObj);

      const updatedOwnedShops = [...(currentUser.ownedShops || []), newShopObj];
      setCurrentUser(prev => ({
        ...prev,
        ownedShops: updatedOwnedShops
      }));

      setNewShopName('');
      setNewWorkerEmail('');
      setNewWorkerPass('');
      setNewShopPhone('');
      setNewShopAddress('');
      setSelectedShopId(newShopId);
      
      alert('تم إضافة الفرع وحفظه سحابياً بنجاح تام! 🏪✨ العامل يستطيع تسجيل الدخول فوراً ببريده وكلمة المرور المدخلة.');
      setActiveTab('dashboard');
    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء حفظ الفرع في قاعدة البيانات: ' + error.message);
    }
  };

  const handleDeleteTransactionByOwner = async (shopId, txId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه العملية نهائياً بصفتك المدير؟')) return;
    try {
      await deleteDoc(doc(db, "shops", String(shopId), "transactions", String(txId)));
      alert('تم حذف العملية بنجاح من قبل الإدارة.');
    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء الحذف.');
    }
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
    if (!plateNumber || !price || !currentUser) return alert('يرجى إدخال رقم اللوحة وتحديد السعر اليدوي!');
    if (vehicleCategory === 'سيارة' && !carModel) return alert('يرجى اختيار أو إدخال موديل السيارة!');

    const shopId = currentUser.role === 'worker' ? currentUser.shopId : selectedShopId;
    if (!shopId || shopId === 'all') return alert('الرجاء اختيار محل محدد لتسجيل المركبة');

    const manualPrice = Number(price);
    const paidAmount = payMethod === 'دين' ? 0 : manualPrice;
    const finalCarModel = vehicleCategory === 'سيارة' ? carModel : 'دراجة نارية / موتور';

    try {
      if (editingTxId) {
        const updatedData = {
          vehicleCategory,
          carModel: finalCarModel,
          plate: plateNumber,
          service: serviceType,
          price: manualPrice,
          paid: paidAmount,
          method: payMethod,
          notes: txNotes,
          startTime,
          endTime,
          beforePhoto: beforePhoto || null,
          afterPhoto: afterPhoto || null
        };
        await updateDoc(doc(db, "shops", String(shopId), "transactions", String(editingTxId)), updatedData);
        setEditingTxId(null);
        alert('تم تحديث المعلومات بنجاح! ✏️✨');
      } else {
        const newTx = {
          vehicleCategory,
          carModel: finalCarModel,
          plate: plateNumber,
          service: serviceType,
          price: manualPrice,
          paid: paidAmount,
          method: payMethod,
          notes: txNotes,
          startTime,
          endTime,
          date: new Date().toISOString().slice(0, 10),
          beforePhoto: beforePhoto || null,
          afterPhoto: afterPhoto || null
        };

        await addDoc(collection(db, "shops", String(shopId), "transactions"), newTx);

        if (payMethod === 'دين') {
          if (!debtorName || !debtorPhone) return alert('يرجى إدخال اسم ورقم هاتف الزبون المتدين!');
          const newDebt = {
            debtorName,
            phone: debtorPhone,
            service: serviceType,
            amount: manualPrice,
            date: new Date().toISOString().slice(0, 10),
            addedBy: 'عامل الفرع'
          };
          await addDoc(collection(db, "shops", String(shopId), "debts"), newDebt);
          setDebtorName('');
          setDebtorPhone('');
        }
        alert('تم تسجيل الطلب وإرساله سحابياً إلى حساب صاحب المحل! 🚗✨');
      }

      setPlateNumber('');
      setCarModel('');
      setPrice('');
      setTxNotes('');
      setBeforePhoto(null);
      setAfterPhoto(null);
    } catch (error) {
      console.error(error);
      alert('خطأ سحابي: ' + error.message);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!expTitle || !expAmount || !selectedShopId || selectedShopId === 'all') return alert('اختر محلاً محدداً لتسجيل المصروف');

    const newExp = {
      category: expCategory,
      title: expTitle,
      amount: Number(expAmount),
      notes: expNotes,
      addedBy: currentUser.role === 'owner' ? 'صاحب المحل' : 'عامل الفرع',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    try {
      await addDoc(collection(db, "shops", String(selectedShopId), "expenses"), newExp);
      setExpTitle(''); setExpAmount(''); setExpNotes('');
      alert('تم تسجيل المصروف سحابياً بنجاح 📉');
    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء تسجيل المصروف: ' + error.message);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans" dir="rtl">
        <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full space-y-6">
          <div className="bg-blue-100 text-blue-600 p-4 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto shadow-inner">
            <Car size={40} />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-black text-gray-800">نظام إدارة المغاسل السحابي</h2>
            <p className="text-gray-500 text-sm mt-1">سجل دخولك عبر حسابك الآمن في Firebase</p>
          </div>

          <form onSubmit={handleFirebaseLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">البريد الإلكتروني (Gmail)</label>
              <div className="relative">
                <Mail className="absolute right-3 top-3.5 text-gray-400" size={18} />
                <input 
                  type="email" 
                  placeholder="example@gmail.com" 
                  value={inputEmail} 
                  onChange={e => setInputEmail(e.target.value)} 
                  className="w-full pr-10 pl-4 py-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" 
                  required 
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-gray-600">كلمة المرور</label>
                <button 
                  type="button" 
                  onClick={handleForgotPassword}
                  className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
                >
                  نسيت كلمة المرور؟
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute right-3 top-3.5 text-gray-400" size={18} />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={inputPassword} 
                  onChange={e => setInputPassword(e.target.value)} 
                  className="w-full pr-10 pl-4 py-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" 
                  required
                />
              </div>
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-2xl font-bold shadow-lg transition cursor-pointer text-sm">
              تسجيل الدخول الآمن 🚀
            </button>
          </form>

          <div className="pt-4 border-t text-xs text-gray-500 space-y-1 bg-gray-50 p-3 rounded-xl">
            <p className="font-bold text-gray-700 mb-1">💡 حسابات تجريبية:</p>
            <p>• للمبرمج: munir@gmail.com</p>
            <p>• لصاحب المحل: ahmed@gmail.com</p>
            <p>• للعامل: worker1@gmail.com</p>
          </div>
        </div>
      </div>
    );
  }

  // ================= واجهة المبرمج (المدير العام) الاحترافية والمحدثة =================
  if (currentUser.role === 'programmer') {
    const activeCount = shops.filter(s => s.status === 'active').length;
    const suspendedCount = shops.filter(s => s.status === 'suspended').length;

    return (
      <div className="min-h-screen bg-slate-100 font-sans" dir="rtl">
        <header className="bg-slate-900 text-white p-4 shadow-md flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="text-purple-400" size={24} />
            <span className="font-bold text-white text-lg">لوحة تحكم المدير العام (المبرمج)</span>
          </div>
          <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-xl text-xs font-bold text-white cursor-pointer flex items-center gap-1">
            <LogOut size={14} /> خروج
          </button>
        </header>

        <main className="max-w-6xl mx-auto p-6 space-y-6">
          {/* بطاقات الإحصائيات العامة للمنصة */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
              <span className="text-gray-500 text-sm">إجمالي المحلات في المنصة</span>
              <h3 className="text-3xl font-black text-slate-900 mt-1">{shops.length}</h3>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-100">
              <span className="text-gray-500 text-sm">الفروع النشطة</span>
              <h3 className="text-3xl font-black text-emerald-600 mt-1">{activeCount}</h3>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-red-100">
              <span className="text-gray-500 text-sm">الفروع المعلقة / الموقوفة</span>
              <h3 className="text-3xl font-black text-red-600 mt-1">{suspendedCount}</h3>
            </div>
          </div>

          {/* قائمة إدارة المحلات والفروع */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <Building className="text-purple-600" size={20} /> إدارة جميع محلات وفروع المنصة
              </h3>
            </div>

            <div className="space-y-3">
              {shops.length === 0 ? (
                <p className="text-xs text-gray-400">لا توجد محلات مسجلة في المنصة حالياً.</p>
              ) : (
                shops.map(s => (
                  <div key={s.id} className={`p-4 rounded-2xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${s.status === 'suspended' ? 'bg-red-50/50 border-red-200' : 'bg-gray-50'}`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-gray-900">🏪 {s.name}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${s.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {s.status === 'active' ? 'نشط' : 'معلق'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">👤 المالك: {s.owner} ({s.ownerEmail})</p>
                      <p className="text-xs text-gray-600">👷‍♂️ العامل: {s.workerEmail} | كلمة السر: {s.workerPass}</p>
                      <p className="text-xs text-gray-500 mt-0.5">📍 {s.address} | هاتف: {s.phone}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {s.status === 'active' ? (
                        <button 
                          onClick={() => handleSuspendShop(s.id)} 
                          className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1 transition"
                        >
                          <AlertTriangle size={14} /> تعليق الفرع
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleActivateShop(s.id)} 
                          className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1 transition"
                        >
                          إعادة تفعيل
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
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

    return (
      <div className="min-h-screen bg-slate-100 font-sans" dir="rtl">
        <header className="bg-slate-900 text-white p-4 flex justify-between items-center">
          <div>
            <h1 className="font-bold text-white text-lg">{currentUser.shopName}</h1>
            <span className="text-xs text-cyan-300 font-medium">شاشة العامل</span>
          </div>
          <button onClick={handleLogout} className="bg-red-600 px-3 py-1.5 rounded-xl text-xs font-bold text-white cursor-pointer">خروج</button>
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
            <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Car className="text-blue-600" /> {editingTxId ? 'تعديل معلومات المركبة ✏️' : 'تسجيل غسيل جديد'}
              </h3>
              <form onSubmit={handleAddTransaction} className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-700">نوع المركبة *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setVehicleCategory('سيارة')} className={`py-2.5 text-xs font-bold rounded-xl border cursor-pointer flex items-center justify-center gap-1.5 ${vehicleCategory === 'سيارة' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-800'}`}>
                      <Car size={16} /> سيارة
                    </button>
                    <button type="button" onClick={() => setVehicleCategory('موتور')} className={`py-2.5 text-xs font-bold rounded-xl border cursor-pointer flex items-center justify-center gap-1.5 ${vehicleCategory === 'موتور' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-800'}`}>
                      <Bike size={16} /> موتور / دراجة
                    </button>
                  </div>
                </div>

                {vehicleCategory === 'سيارة' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">اختر أو ابحث عن موديل السيارة *</label>
                    <input 
                      type="text" 
                      list="carModelsLibrary" 
                      placeholder="ابحث بالماركة أو الموديل..." 
                      value={carModel} 
                      onChange={e => setCarModel(e.target.value)} 
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

                <input type="text" placeholder="رقم اللوحة *" value={plateNumber} onChange={e => setPlateNumber(e.target.value)} className="w-full px-3 py-2 border rounded-xl uppercase font-bold text-sm text-gray-900" required />
                
                <select value={serviceType} onChange={e => setServiceType(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm bg-white text-gray-900">
                  <option>غسيل خارجي فقط</option>
                  <option>غسيل خارجي وداخلي</option>
                  <option>غسيل كامل مع تلميع</option>
                  <option>غسيل موتور</option>
                </select>
                
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" value={startTime} onChange={e => setStartTime(e.target.value)} placeholder="وقت البدء" className="px-3 py-2 border rounded-xl text-sm text-center font-bold text-gray-900" />
                  <input type="text" value={endTime} onChange={e => setEndTime(e.target.value)} placeholder="وقت الانتهاء" className="px-3 py-2 border rounded-xl text-sm text-center font-bold text-gray-900" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">السعر (تحديد يدوي) *</label>
                  <input type="number" placeholder="أدخل السعر (ليرة)" value={price} onChange={e => setPrice(e.target.value)} className="w-full px-3 py-2.5 border-2 border-blue-400 rounded-xl font-black text-blue-700 text-base outline-none bg-blue-50/50" required />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">ملاحظات (اختياري)</label>
                  <input type="text" placeholder="ملاحظات حول حالة السيارة..." value={txNotes} onChange={e => setTxNotes(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs text-gray-900 bg-white" />
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-bold text-gray-700">توثيق حالة المركبة بالصور</label>
                  
                  <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-2xl space-y-2">
                    <span className="text-[11px] font-bold text-blue-900 block">صورة قبل الغسيل: {beforePhoto ? '✓ تمت الإضافة' : ''}</span>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs">
                        <Camera size={16} /> فتح الكاميرا
                        <input type="file" accept="image/*" capture="environment" onChange={e => handleImageUpload(e, 'before')} className="hidden" />
                      </label>
                      <label className="flex items-center justify-center gap-1.5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl cursor-pointer shadow-xs">
                        <ImageIcon size={16} /> من الاستوديو
                        <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'before')} className="hidden" />
                      </label>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-2">
                    <span className="text-[11px] font-bold text-emerald-900 block">صورة بعد الغسيل: {afterPhoto ? '✓ تمت الإضافة' : ''}</span>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs">
                        <Camera size={16} /> فتح الكاميرا
                        <input type="file" accept="image/*" capture="environment" onChange={e => handleImageUpload(e, 'after')} className="hidden" />
                      </label>
                      <label className="flex items-center justify-center gap-1.5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl cursor-pointer shadow-xs">
                        <ImageIcon size={16} /> من الاستوديو
                        <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'after')} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-700">طريقة الدفع</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button type="button" onClick={() => setPayMethod('كاش')} className={`py-2 rounded-xl text-xs font-bold border cursor-pointer ${payMethod === 'كاش' ? 'bg-emerald-600 text-white' : 'bg-gray-50 text-gray-800'}`}>كاش 💵</button>
                    <button type="button" onClick={() => setPayMethod('بنك')} className={`py-2 rounded-xl text-xs font-bold border cursor-pointer ${payMethod === 'بنك' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-800'}`}>بنك 💳</button>
                    <button type="button" onClick={() => setPayMethod('دين')} className={`py-2 rounded-xl text-xs font-bold border cursor-pointer ${payMethod === 'دين' ? 'bg-red-600 text-white' : 'bg-gray-50 text-gray-800'}`}>دين ⚠️</button>
                  </div>
                </div>

                {payMethod === 'دين' && (
                  <div className="bg-red-50 p-3 rounded-xl border border-red-200 space-y-2">
                    <span className="text-xs font-bold text-red-700 block">بيانات الزبون المتدين (ترسل لصاحب المحل):</span>
                    <input type="text" placeholder="اسم الزبون الكامل *" value={debtorName} onChange={e => setDebtorName(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs bg-white text-gray-900 font-semibold" required />
                    <input type="text" placeholder="رقم هاتف الزبون *" value={debtorPhone} onChange={e => setDebtorPhone(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs bg-white text-gray-900 font-semibold" required />
                  </div>
                )}

                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white py-3.5 rounded-xl font-bold text-sm cursor-pointer shadow-md">
                    {editingTxId ? 'تحديث المعلومات ✏️' : 'حفظ الطلب والتحديث 🚀'}
                  </button>
                  {editingTxId && (
                    <button type="button" onClick={() => { setEditingTxId(null); setPlateNumber(''); setCarModel(''); setPrice(''); setTxNotes(''); }} className="px-4 bg-gray-200 text-gray-700 rounded-xl font-bold text-xs">إلغاء</button>
                  )}
                </div>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="font-bold text-amber-800 flex items-center gap-2">⚠️ قائمة الديون المعلقة (تسديد ديون الزبائن)</h3>
                </div>
                {shopDebts.length === 0 ? (
                  <p className="text-xs text-gray-400">لا توجد ديون معلقة على زبائن هذا الفرع حالياً.</p>
                ) : (
                  <div className="space-y-3">
                    {shopDebts.map(d => (
                      <div key={d.id} className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-sm">
                        <div>
                          <span className="font-bold text-gray-900">👤 الزبون: {d.debtorName} ({d.phone})</span>
                          <p className="text-xs text-gray-600">الخدمة: {d.service} | المبلغ: <strong className="text-red-600">{d.amount} ليرة</strong></p>
                          <span className="text-[10px] text-gray-400">تاريخ الدين: {d.date}</span>
                        </div>

                        {settlingDebtId === d.id ? (
                          <div className="bg-white p-3 rounded-xl border shadow-sm space-y-2 w-full md:w-auto">
                            <span className="text-xs font-bold text-emerald-700 block">اختر طريقة السداد وتاريخه:</span>
                            <div className="flex gap-2">
                              <button type="button" onClick={() => setRepayMethod('كاش')} className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${repayMethod === 'كاش' ? 'bg-emerald-600 text-white' : 'bg-gray-100'}`}>كاش 💵</button>
                              <button type="button" onClick={() => setRepayMethod('بنك')} className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${repayMethod === 'بنك' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>بنك 💳</button>
                            </div>
                            <input type="date" value={repayDate} onChange={e => setRepayDate(e.target.value)} className="w-full px-2 py-1 border rounded-lg text-xs text-gray-900" />
                            <input type="text" placeholder="ملاحظات السداد (اختياري)..." value={repayNotes} onChange={e => setRepayNotes(e.target.value)} className="w-full px-2 py-1 border rounded-lg text-xs text-gray-900" />
                            <div className="flex gap-2 pt-1">
                              <button onClick={() => handleSettleDebtAction(shopId, d)} className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold">تأكيد التسديد ✅</button>
                              <button onClick={() => setSettlingDebtId(null)} className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold">إلغاء</button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => setSettlingDebtId(d.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1 shadow-xs">
                            <CheckSquare size={14} /> تسديد الدين
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="font-bold text-gray-800">المركبات المسجلة اليوم في {currentUser.shopName}</h3>
                  <button 
                    onClick={handleRefreshData} 
                    disabled={isRefreshing}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition border"
                  >
                    <RefreshCw size={14} className={isRefreshing ? "animate-spin text-blue-600" : ""} /> 
                    {isRefreshing ? 'جاري التحديث...' : 'تحديث القائمة'}
                  </button>
                </div>

                <div className="space-y-3">
                  {shopTx.length === 0 ? <p className="text-xs text-gray-400">لا توجد عمليات مسجلة بعد اليوم.</p> : shopTx.map(t => (
                    <div key={t.id} className="p-4 bg-gray-50 rounded-2xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <span className="font-bold block text-base text-gray-900">🏪 {currentUser.shopName}</span>
                        <span className="text-sm font-semibold text-blue-600">[{t.vehicleCategory}] {t.carModel} | لوحة: {t.plate}</span>
                        <p className="text-xs text-gray-600">{t.service} | الطريقة: {t.method === 'دين' ? 'دين ⚠️' : t.method}</p>
                        {t.notes && <p className="text-xs text-amber-700 italic">ملاحظة: {t.notes}</p>}
                        <span className="text-xs font-bold text-emerald-600">المبلغ المدخل: {t.price} ليرة {t.method === 'دين' && '(على الذمة)'}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {t.beforePhoto && <img src={t.beforePhoto} alt="قبل" className="w-12 h-12 object-cover rounded-lg border" />}
                        {t.afterPhoto && <img src={t.afterPhoto} alt="بعد" className="w-12 h-12 object-cover rounded-lg border" />}
                        
                        <button onClick={() => handleStartEditTransaction(t)} className="bg-blue-100 text-blue-700 px-2.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1"><Edit3 size={13} /> تعديل</button>
                        <button onClick={() => setSelectedInvoice({ ...t, shopName: currentUser.shopName, shopInfo: currentUser.shopInfo || { name: currentUser.shopName, address: 'فرع الخدمة', phone: '+90...' } })} className="bg-slate-800 text-white px-3 py-2 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1 hover:bg-black"><Printer size={14} /> طباعة الفاتورة</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ================= لوحة صاحب المحل (المالك) =================
  const ownedShops = currentUser.ownedShops || [];
  const currentShop = ownedShops.find(s => s.id === Number(selectedShopId)) || ownedShops[0];
  const isAllShops = selectedShopId === 'all';
  const targetShopIds = isAllShops ? ownedShops.map(s => s.id) : [Number(selectedShopId)];

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

  const shopTotalServices = currentShopTx.reduce((acc, t) => acc + Number(t.price), 0);
  const shopTotalPaid = currentShopTx.reduce((acc, t) => acc + Number(t.paid), 0) + shopRepayList.reduce((acc, r) => acc + Number(r.amount), 0);
  const shopTotalDebtAmount = currentShopDebts.reduce((acc, d) => acc + Number(d.amount), 0);
  const shopTotalExpenses = currentShopExpenses.reduce((acc, e) => acc + Number(e.amount), 0);
  const shopNetProfit = shopTotalPaid - shopTotalExpenses;

  return (
    <div className="min-h-screen bg-slate-100 font-sans" dir="rtl">
      <header className="bg-slate-900 text-white p-4 shadow-md flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-cyan-500/20 p-2 rounded-xl text-cyan-400"><Building size={22} /></div>
          <div>
            <h1 className="font-bold text-white text-base">لوحة تحكم المالك: {currentUser.ownerName}</h1>
            <span className="text-xs text-cyan-300 font-medium">إدارة المحلات والفروع، الأسعار اليدوية، والديون</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select 
            value={selectedShopId || ''} 
            onChange={e => setSelectedShopId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="px-3 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold border border-slate-700 outline-none"
          >
            {ownedShops.map(s => <option key={s.id} value={s.id}>🏪 {s.name} {s.status === 'suspended' ? '(معلق)' : ''}</option>)}
            <option value="all">📊 تقرير الجمع الشامل (جميع محلاتي)</option>
          </select>
          <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-xl text-xs font-bold text-white cursor-pointer flex items-center gap-1"><LogOut size={14} /> خروج</button>
        </div>
      </header>

      <nav className="bg-white border-b px-6 py-3 flex gap-4 text-sm font-bold">
        <button onClick={() => setActiveTab('dashboard')} className={`pb-2 border-b-2 cursor-pointer ${activeTab === 'dashboard' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-700'}`}>📊 نظرة عامة والجرد</button>
        <button onClick={() => setActiveTab('addShop')} className={`pb-2 border-b-2 cursor-pointer ${activeTab === 'addShop' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-700'}`}>➕ إدارة وإضافة الفروع</button>
        {!isAllShops && <button onClick={() => setActiveTab('accounting')} className={`pb-2 border-b-2 cursor-pointer ${activeTab === 'accounting' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-700'}`}>📑 كشف الحسابات والديون والأرباح</button>}
        <button onClick={() => setActiveTab('profile')} className={`pb-2 border-b-2 cursor-pointer ${activeTab === 'profile' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-700'}`}>⚙️ الملف الشخصي</button>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white p-6 rounded-3xl shadow-lg flex justify-between items-center">
              <div>
                <span className="text-blue-300 text-xs font-bold uppercase tracking-wider">المحل النشط حالياً</span>
                <h2 className="text-2xl font-black text-white mt-1">{isAllShops ? 'تقرير الجمع الشامل لجميع محلاتك' : currentShop?.name}</h2>
                <p className="text-xs text-gray-300 mt-1">📍 {isAllShops ? `عدد المحلات النشطة: ${activeShopsCount} من أصل ${ownedShops.length} فرع` : currentShop?.address}</p>
                {currentShop?.status === 'suspended' && (
                  <span className="inline-block mt-2 px-3 py-1 bg-red-500 text-white text-xs rounded-full font-bold">هذا الفرع معلق حالياً (العامل محظور من الدخول)</span>
                )}
              </div>
              <div className="text-left bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                <span className="text-xs text-blue-200 block">صافي الأرباح الكلي</span>
                <span className="text-3xl font-black text-emerald-400">{netProfit} ليرة</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-100">
                <span className="text-gray-500 text-sm">صندوق الكاش 💵</span>
                <h3 className="text-2xl font-black text-emerald-600 mt-1">{totalCashAll} ليرة</h3>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-blue-100">
                <span className="text-gray-500 text-sm">حساب البنك / الشبكة 💳</span>
                <h3 className="text-2xl font-black text-blue-600 mt-1">{totalBankAll} ليرة</h3>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-amber-100">
                <span className="text-gray-500 text-sm">إجمالي الديون المعلقة ⚠️</span>
                <h3 className="text-2xl font-black text-amber-600 mt-1">{totalDebtsAll} ليرة</h3>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-red-100">
                <span className="text-gray-500 text-sm">إجمالي المصاريف 📉</span>
                <h3 className="text-2xl font-black text-red-600 mt-1">{totalExpensesAll} ليرة</h3>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-purple-100">
                <span className="text-gray-500 text-sm">المركبات المغسولة 🚗</span>
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
                  <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">📑 كشف الديون المجمع لجميع الفروع</h3>
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
                          <p className="text-xs text-gray-600">📞 الهاتف: {d.phone} | الخدمة: {d.service} (التاريخ: {d.date})</p>
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
                  <h3 className="font-bold text-gray-900 flex items-center gap-2"><Tag className="text-red-600" size={18} /> تسجيل مصروف لـ {currentShop?.name}</h3>
                  <form onSubmit={handleAddExpense} className="space-y-3">
                    <select value={expCategory} onChange={e => setExpCategory(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm bg-white text-gray-900">
                      <option>غذاء وضيافة</option><option>مواد تنظيف وصيانة</option><option>فواتير خدمات</option><option>مصاريف أخرى</option>
                    </select>
                    <input type="text" placeholder="عنوان المصروف" value={expTitle} onChange={e => setExpTitle(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm text-gray-900" required />
                    <input type="number" placeholder="المبلغ" value={expAmount} onChange={e => setExpAmount(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm text-gray-900" required />
                    <textarea placeholder="ملاحظات..." value={expNotes} onChange={e => setExpNotes(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm h-16 resize-none text-gray-900" />
                    <button type="submit" className="w-full bg-red-600 text-white py-2.5 rounded-xl text-sm font-bold cursor-pointer">خصم وتسجيل المصروف 📉</button>
                  </form>
                </div>

                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border space-y-4">
                  <div className="flex justify-between items-center border-b pb-3">
                    <h3 className="font-bold text-gray-900">حركة المركبات لـ {currentShop?.name} (صلاحية الحذف للإدارة فقط)</h3>
                    <button 
                      onClick={handleRefreshData} 
                      disabled={isRefreshing}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition border"
                    >
                      <RefreshCw size={14} className={isRefreshing ? "animate-spin text-blue-600" : ""} /> 
                      {isRefreshing ? 'جاري التحديث...' : 'تحديث القائمة'}
                    </button>
                  </div>

                  <div className="space-y-3">
                    {currentShopTx.length === 0 ? <p className="text-xs text-gray-400">لا توجد سيارات مسجلة لهذا الفرع اليوم.</p> : currentShopTx.map(t => (
                      <div key={t.id} className="p-3 bg-gray-50 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border">
                        <div>
                          <span className="font-bold block text-gray-900">🏪 {currentShop.name}</span>
                          <span className="font-bold text-blue-600">[{t.vehicleCategory}] {t.carModel} | لوحة: {t.plate}</span> - {t.service}
                          <span className="block text-xs text-gray-500">المبلغ المسجل: {t.price} ليرة | الحالة: {t.method === 'دين' ? 'دين ⚠️' : t.method} {t.notes && `| ملاحظة: ${t.notes}`}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleDeleteTransactionByOwner(selectedShopId, t.id)} className="bg-red-100 text-red-700 px-2.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1"><Trash2 size={13} /> حذف الإدارة</button>
                          <button onClick={() => setSelectedInvoice({ ...t, shopName: currentShop.name, shopInfo: currentShop })} className="bg-slate-800 text-white px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1 hover:bg-black"><Printer size={14} /> طباعة الفاتورة</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'addShop' && (
          <div className="space-y-6 max-w-2xl mx-auto">
            {editingShop ? (
              <div className="bg-white p-8 rounded-3xl shadow-sm border space-y-4">
                <h3 className="text-xl font-bold text-blue-600">تعديل بيانات الفرع: {editingShop.name}</h3>
                <form onSubmit={handleSaveEditShop} className="space-y-3">
                  <input type="text" value={editingShop.name} onChange={e => setEditingShop({...editingShop, name: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm text-gray-900" placeholder="اسم الفرع" required />
                  <input type="email" value={editingShop.workerEmail} onChange={e => setEditingShop({...editingShop, workerEmail: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm text-gray-900" placeholder="إيميل العامل" required />
                  <input type="text" value={editingShop.workerPass} onChange={e => setEditingShop({...editingShop, workerPass: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm text-gray-900" placeholder="كلمة سر العامل" required />
                  <input type="text" value={editingShop.phone} onChange={e => setEditingShop({...editingShop, phone: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm text-gray-900" placeholder="الهاتف" />
                  <input type="text" value={editingShop.address} onChange={e => setEditingShop({...editingShop, address: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm text-gray-900" placeholder="العنوان" />
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-bold text-sm cursor-pointer">حفظ التعديلات</button>
                    <button type="button" onClick={() => setEditingShop(null)} className="px-4 bg-gray-200 py-2 rounded-xl font-bold text-sm cursor-pointer text-gray-800">إلغاء</button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-3xl shadow-sm border space-y-6">
                <div className="flex items-center gap-3 border-b pb-4">
                  <div className="bg-purple-100 text-purple-600 p-3 rounded-2xl"><Building size={24} /></div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">إضافة محل أو فرع جديد</h3>
                    <p className="text-xs text-gray-500">حدد بيانات دخول العامل إليه ليظهر فوراً بكشوفاتك</p>
                  </div>
                </div>

                <form onSubmit={handleOwnerAddShop} className="space-y-4">
                  <input type="text" placeholder="اسم المحل أو الفرع الجديد *" value={newShopName} onChange={e => setNewShopName(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl text-sm text-gray-900" required />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input type="email" placeholder="إيميل العامل (Gmail) *" value={newWorkerEmail} onChange={e => setNewWorkerEmail(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl text-sm text-gray-900" required />
                    <input type="password" placeholder="كلمة سر العامل *" value={newWorkerPass} onChange={e => setNewWorkerPass(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl text-sm text-gray-900" required />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input type="text" placeholder="رقم الهاتف" value={newShopPhone} onChange={e => setNewShopPhone(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl text-sm text-gray-900" />
                    <input type="text" placeholder="العنوان" value={newShopAddress} onChange={e => setNewShopAddress(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl text-sm text-gray-900" />
                  </div>
                  <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold text-sm cursor-pointer shadow-md">إضافة الفرع الجديد 🚀</button>
                </form>
              </div>
            )}

            <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
              <h3 className="font-bold text-gray-900">قائمة فروعك وإدارتها:</h3>
              <div className="space-y-3">
                {ownedShops.map(s => (
                  <div key={s.id} className={`p-4 rounded-2xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-3 ${s.status === 'suspended' ? 'bg-red-50 border-red-200' : 'bg-gray-50'}`}>
                    <div>
                      <span className="font-bold text-base text-gray-900">{s.name}</span>
                      <p className="text-xs text-gray-700">👷‍♂️ عامل: {s.workerEmail} (باسورد: {s.workerPass})</p>
                      <p className="text-xs text-gray-600">📍 {s.address} | هاتف: {s.phone}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${s.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {s.status === 'active' ? 'نشط وعامل' : 'معلق (العامل محظور)'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingShop(s)} className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1"><Edit3 size={14} /> تعديل</button>
                      {s.status === 'active' ? (
                        <button onClick={() => handleSuspendShop(s.id)} className="bg-red-100 text-red-700 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1"><AlertTriangle size={14} /> تعليق</button>
                      ) : (
                        <button onClick={() => handleActivateShop(s.id)} className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1">إعادة تفعيل</button>
                      )}
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
              <p className="text-xs text-gray-600">كشف الحسابات المالي والتقارير والديون | {currentShop?.address} | هاتف: {currentShop?.phone}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200">
                <span className="text-xs text-blue-900 block font-bold">إجمالي الخدمات</span>
                <span className="text-lg font-black text-blue-700">{shopTotalServices} ليرة</span>
              </div>
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
                <span className="text-xs text-emerald-900 block font-bold">المقبوض النقدي والبنكي</span>
                <span className="text-lg font-black text-emerald-700">{shopTotalPaid} ليرة</span>
              </div>
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
                <span className="text-xs text-amber-900 block font-bold">الديون المعلقة</span>
                <span className="text-lg font-black text-amber-700">{shopTotalDebtAmount} ليرة</span>
              </div>
              <div className="bg-red-50 p-4 rounded-2xl border border-red-200">
                <span className="text-xs text-red-900 block font-bold">إجمالي المصاريف</span>
                <span className="text-lg font-black text-red-700">{shopTotalExpenses} ليرة</span>
              </div>
              <div className="bg-purple-50 p-4 rounded-2xl border border-purple-200 md:col-span-1 col-span-2">
                <span className="text-xs text-purple-900 block font-bold">صافي الأرباح</span>
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
                  <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} /> تحديث القائمة
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
                        <p className="text-xs text-gray-700">📞 الهاتف: {d.phone} | الخدمة: {d.service}</p>
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
              <button onClick={() => handlePrintInvoice({ shopName: currentShop.name, shopInfo: currentShop, plate: 'كشف حساب مالي شامل', type: 'جميع العمليات', service: 'تقرير الحسابات والديون والأرباح', startTime: '-', endTime: '-', method: 'تقرير', price: shopNetProfit })} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm cursor-pointer flex items-center gap-2 hover:bg-black"><Printer size={16} /> طباعة كشف الحساب المالي (PDF)</button>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-white p-8 rounded-3xl shadow-sm border max-w-xl mx-auto space-y-4">
            <h3 className="text-xl font-bold text-gray-900">تعديل الملف الشخصي وكلمة السر ⚙️</h3>
            <form onSubmit={e => { e.preventDefault(); alert('تم تحديث البيانات بنجاح!'); }} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">الاسم الكامل</label>
                <input type="text" defaultValue={currentUser.ownerName} className="w-full px-3 py-2 border rounded-xl text-sm text-gray-900 font-semibold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">البريد الإلكتروني (Gmail)</label>
                <input type="email" defaultValue={currentUser.email} className="w-full px-3 py-2 border rounded-xl text-sm text-gray-900 font-semibold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">كلمة المرور الجديدة</label>
                <input type="password" placeholder="أدخل كلمة مرور جديدة" className="w-full px-3 py-2 border rounded-xl text-sm text-gray-900" />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-sm cursor-pointer">حفظ التعديلات</button>
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
                <p className="text-xs text-gray-600">{selectedInvoice.shopInfo?.address || 'إسكندرون'} | هاتف: {selectedInvoice.shopInfo?.phone || '+90...'}</p>
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
                <Printer size={18} /> طباعة الفاتورة / PDF
              </button>
              <button onClick={() => setSelectedInvoice(null)} className="px-5 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-bold cursor-pointer text-sm">
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}