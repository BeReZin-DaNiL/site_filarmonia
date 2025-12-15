const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 8080;
const SECRET_KEY = 'yourSecretKeyMustBeLongEnoughToBeSecureAndAtLeast256BitsLong';

const fs = require('fs');
const path = require('path');

// Helper to send email (simulation)
const sendEmail = (to, subject, text) => {
    const logPath = path.join(__dirname, 'sent_emails.log');
    const emailContent = `
==================================================
To: ${to}
Date: ${new Date().toISOString()}
Subject: ${subject}
--------------------------------------------------
${text}
==================================================
\n`;

    console.log(`[EMAIL SIMULATION] Sending email to ${to}`);
    // console.log(emailContent); // Uncomment to see full body in console

    try {
        fs.appendFileSync(logPath, emailContent);
    } catch (err) {
        console.error('Failed to write email to log:', err);
    }
};

app.use(cors());
app.use(bodyParser.json());

// In-memory database
const users = [
    {
        id: 1,
        username: 'admin',
        password: 'admin',
        fullName: 'Главный Администратор',
        email: 'admin@philharmonia.ru',
        role: 'ADMIN',
        favorites: [],
        preferences: { genres: [], artists: [] },
        bonuses: 1000,
        phone: '+7 (999) 123-45-67',
        address: { city: 'Москва', street: 'Тверская', house: '1', apartment: '1' },
        birthDate: '1985-05-15',
        language: 'ru',
        notificationSettings: {
            emailAfisha: true,
            emailOffers: false,
            emailReminders: true,
            push: true,
            sms: false
        },
        securitySettings: {
            twoFactorEnabled: true,
            activeSessions: []
        }
    },
    {
        id: 2,
        username: 'user',
        password: 'user',
        fullName: 'Иван Петров',
        email: 'user@example.com',
        role: 'USER',
        favorites: [],
        preferences: { genres: ['Джаз'], artists: [] },
        bonuses: 100,
        phone: '+7 (900) 555-55-55',
        address: { city: 'Москва', street: 'Ленина', house: '10', apartment: '5' },
        birthDate: '1990-01-01',
        language: 'ru',
        notificationSettings: {
            emailAfisha: true,
            emailOffers: true,
            emailReminders: true,
            push: false,
            sms: false
        },
        securitySettings: {
            twoFactorEnabled: false,
            activeSessions: []
        }
    }
];

// Generate 6 events
const events = Array.from({ length: 6 }, (_, i) => {
    const genres = ['Классика', 'Джаз', 'Рок', 'Фолк', 'Опера', 'Балет'];
    const genre = genres[i % 6];
    const venues = ['Большой зал', 'Малый зал', 'Камерный зал'];
    const performersList = [
        'Симфонический оркестр филармонии', 
        'Джаз-бенд "Импровизация"', 
        'Ансамбль народных инструментов', 
        'Приглашенные солисты оперы', 
        'Камерный оркестр',
        'Балетная труппа'
    ];

    return {
        id: i + 1,
        title: `Концерт №${i + 1}: ${genre} вечер`,
        genre: genre,
        description: `Описание мероприятия номер ${i + 1}. Великолепное исполнение лучших произведений. В программе прозвучат шедевры мировой музыкальной культуры. Приходите и насладитесь живой музыкой в исполнении виртуозов.`,
        date: new Date(Date.now() + (i + 1) * 86400000).toISOString(),
        price: 1000 + (i * 100),
        availableTickets: 50 + (i * 5),
        imageUrl: `/Концерт_${i + 1}.jpg`,
        venue: venues[i % 3],
        performers: performersList[i % 6],
        duration: '2 часа',
        ageRestriction: ['6+', '12+', '16+', '18+'][i % 4],
        status: 'active'
    };
});

const orders = [];
const reviews = [];
const polls = [
    {
        id: 1,
        question: "Какого исполнителя вы хотели бы услышать в следующем сезоне?",
        options: [
            { id: 1, text: "Денис Мацуев", votes: 15 },
            { id: 2, text: "Хибла Герзмава", votes: 12 },
            { id: 3, text: "Теодор Курентзис", votes: 20 },
            { id: 4, text: "Борис Березовский", votes: 8 }
        ],
        active: true
    },
    {
        id: 2,
        question: "Какой жанр стоит добавить в программу?",
        options: [
            { id: 1, text: "Неоклассика", votes: 45 },
            { id: 2, text: "Этно-джаз", votes: 30 },
            { id: 3, text: "Киномузыка", votes: 60 }
        ],
        active: true
    }
];
const chatMessages = [];
const auditLogs = []; // Audit logs for admin actions

// Initial News Data
let news = [
    {
        id: 1,
        title: "Открытие нового концертного сезона 2024",
        date: "2024-09-01",
        summary: "Филармония приглашает всех любителей музыки на торжественное открытие нового сезона. Вас ждут премьеры и выступления мировых звезд.",
        content: `<p>Мы рады объявить об открытии нового концертного сезона 2024! В этом году мы подготовили для вас невероятно насыщенную программу, включающую как классические шедевры, так и современные экспериментальные постановки.</p><p>Открытие сезона состоится 15 сентября гала-концертом с участием приглашенных солистов Большого театра и нашего симфонического оркестра под управлением главного дирижера.</p><h3 class="text-xl font-bold mt-4 mb-2">Что вас ждет в новом сезоне:</h3><ul class="list-disc pl-6 mb-4"><li>Серия концертов "Великие композиторы XX века"</li><li>Джазовые вечера по пятницам</li><li>Образовательные программы для детей и молодежи</li><li>Эксклюзивные встречи с артистами перед концертами</li></ul><p>Билеты уже в продаже в кассах города и на нашем сайте. Не упустите возможность стать частью музыкальной истории!</p>`,
        image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: 2,
        title: "Мастер-класс от известного пианиста",
        date: "2024-09-10",
        summary: "Уникальная возможность для юных музыкантов посетить мастер-класс лауреата международных конкурсов.",
        content: `<p>10 октября в малом зале филармонии пройдет открытый мастер-класс выдающегося пианиста современности. Это событие станет настоящим подарком для студентов музыкальных училищ и консерватории.</p><p>Маэстро поделится секретами мастерства, расскажет о тонкостях интерпретации произведений Шопена и Рахманинова, а также ответит на вопросы публики.</p><p>Вход на мероприятие свободный по предварительной регистрации. Количество мест ограничено.</p>`,
        image: "https://images.unsplash.com/photo-1552422535-c45813c61732?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: 3,
        title: "Благотворительный концерт 'Музыка добра'",
        date: "2024-09-25",
        summary: "Все средства, собранные от продажи билетов, будут направлены в фонд поддержки одаренных детей.",
        content: `<p>Приглашаем вас на особенный вечер — благотворительный концерт "Музыка добра". В программе концерта прозвучат самые светлые и вдохновляющие произведения мировой классики.</p><p>Все артисты выступают безвозмездно, а вырученные средства пойдут на покупку музыкальных инструментов для воспитанников детских домов.</p><p>Давайте вместе подарим детям возможность заниматься творчеством и верить в мечту!</p>`,
        image: "/news.jpg"
    },
    {
        id: 4,
        title: "Обновление интерьеров Большого зала",
        date: "2024-08-15",
        summary: "Завершен масштабный ремонт Большого зала. Улучшена акустика и установлены новые комфортабельные кресла.",
        content: `<p>С гордостью сообщаем о завершении реставрационных работ в Большом зале филармонии. Ремонт длился все лето, и теперь зал готов встречать гостей в обновленном виде.</p><p>Главным достижением стала модернизация акустической системы: были заменены звукоотражающие панели, что позволило добиться идеального звучания в любой точке зала.</p><p>Также мы позаботились о вашем комфорте и установили новые эргономичные кресла. Приходите и оцените сами!</p>`,
        image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: 5,
        title: "Фестиваль джазовой музыки 'Осенний свинг'",
        date: "2024-10-05",
        summary: "Три дня джаза, импровизации и отличного настроения. Специальные гости из Нового Орлеана.",
        content: `<p>Этой осенью город накроет волна джаза! Фестиваль "Осенний свинг" соберет на одной сцене лучших джазменов страны и зарубежья.</p><p>В программе фестиваля:</p><ul class="list-disc pl-6 mb-4"><li>Выступления биг-бендов</li><li>Джем-сейшны до утра</li><li>Танцевальные мастер-классы по линди-хопу</li></ul><p>Хедлайнерами фестиваля станут гости из родины джаза — Нового Орлеана. Это будет незабываемо!</p>`,
        image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&q=80&w=800"
    }
];

// Initial FAQ Data
let faq = [
    { id: 1, question: "Как купить билет на концерт?", answer: "Билеты можно приобрести на нашем сайте в разделе 'Афиша', выбрав интересующее мероприятие, или в кассе филармонии. Мы принимаем к оплате банковские карты и наличные." },
    { id: 2, question: "Можно ли вернуть билет?", answer: "Да, возврат билетов возможен не позднее чем за 3 дня до начала мероприятия. Для возврата электронного билета воспользуйтесь формой в личном кабинете или обратитесь в службу поддержки." },
    { id: 3, question: "Есть ли скидки для студентов и пенсионеров?", answer: "Да, мы предоставляем скидку 50% для студентов и пенсионеров при предъявлении соответствующего удостоверения в кассе. Обратите внимание, что количество льготных билетов может быть ограничено." },
    { id: 4, question: "Нужно ли распечатывать электронный билет?", answer: "Нет, распечатывать билет не обязательно. Достаточно показать QR-код билета на экране вашего смартфона контролеру при входе." },
    { id: 5, question: "Есть ли в филармонии дресс-код?", answer: "Строгого дресс-кода нет, но мы рекомендуем придерживаться стиля Smart Casual или вечернего стиля. Пожалуйста, воздержитесь от посещения концертов в спортивной или пляжной одежде." },
    { id: 6, question: "Можно ли прийти на концерт с детьми?", answer: "Мы рады юным слушателям! Однако просим учитывать возрастные ограничения, указанные в афише каждого мероприятия. Для детей до 3 лет вход на вечерние концерты, как правило, не рекомендован." },
    { id: 7, question: "Как добраться до филармонии?", answer: "Филармония расположена в центре города. Рядом находятся станции метро 'Театральная' и 'Охотный ряд'. Также имеется платная городская парковка." },
    { id: 8, question: "Можно ли снимать фото или видео во время концерта?", answer: "Профессиональная съемка разрешена только по предварительной аккредитации. Любительская съемка на телефон разрешена без использования вспышки, если это не мешает артистам и другим зрителям." }
];

// System Settings
let systemSettings = {
    general: {
        siteName: 'Филармония',
        maintenanceMode: false,
        supportEmail: 'support@philharmonia.ru',
        supportPhone: '8 (800) 555-35-35'
    },
    booking: {
        maxTicketsPerOrder: 5,
        reservationTimeoutMinutes: 15,
        enableRefunds: true
    },
    ui: {
        themeColor: '#e11d48', // Primary red
        showNewsOnHome: true,
        itemsPerPage: 6
    }
};

// Helper to generate token
const generateToken = (user) => {
  return jwt.sign({ sub: user.username, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
};

// Middleware to check auth
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Middleware to check admin role
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'ADMIN') return res.sendStatus(403);
    next();
};

// Helper to add audit log
const addAuditLog = (action, targetId, targetType, adminUsername, details = '') => {
    auditLogs.push({
        id: auditLogs.length + 1,
        timestamp: new Date().toISOString(),
        action,
        targetId,
        targetType,
        admin: adminUsername,
        details
    });
};

// --- AUTH ---

app.post('/api/auth/register', (req, res) => {
  const { username, password, fullName, email } = req.body;

  if (users.find(u => u.username === username)) {
    return res.status(409).json({ message: 'Username already taken' });
  }

  const newUser = {
    id: users.length + 1,
    username,
    password, // In real app, hash this!
    fullName,
    email,
    role: 'USER', // Default role
    favorites: [],
    preferences: { genres: [], artists: [] },
    bonuses: 0,
    // New fields for profile editing
    phone: '',
    address: { city: '', street: '', house: '', apartment: '' },
    birthDate: '',
    language: 'ru',
    notificationSettings: {
        emailAfisha: true,
        emailOffers: false,
        emailReminders: true,
        push: true,
        sms: false
    },
    securitySettings: {
        twoFactorEnabled: false,
        activeSessions: [
            { id: 1, device: 'Chrome / Windows', ip: '192.168.1.1', date: new Date().toISOString() }
        ]
    }
  };
  
  // Admin backdoor for testing
  if (username.toLowerCase().includes('admin')) {
      newUser.role = 'ADMIN';
  }

  users.push(newUser);
  const token = generateToken(newUser);
  res.json({ 
      token, 
      role: newUser.role,
      username: newUser.username,
      fullName: newUser.fullName,
      email: newUser.email
  });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = generateToken(user);
  res.json({ 
      token, 
      role: user.role,
      username: user.username,
      fullName: user.fullName,
      email: user.email
  });
});

// --- USERS ---

app.get('/api/users/me', authenticateToken, (req, res) => {
    const user = users.find(u => u.username === req.user.sub);
    if (!user) return res.sendStatus(404);
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
});

app.put('/api/users/me', authenticateToken, (req, res) => {
    const user = users.find(u => u.username === req.user.sub);
    if (!user) return res.sendStatus(404);
    
    const { fullName, email, password, phone, address, birthDate, language, notificationSettings, securitySettings } = req.body;
    
    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (password) user.password = password;
    if (req.body.preferences) user.preferences = req.body.preferences;
    
    // New fields
    if (phone !== undefined) user.phone = phone;
    if (address) user.address = { ...user.address, ...address };
    if (birthDate) user.birthDate = birthDate;
    if (language) user.language = language;
    if (notificationSettings) user.notificationSettings = { ...user.notificationSettings, ...notificationSettings };
    if (securitySettings) user.securitySettings = { ...user.securitySettings, ...securitySettings };
    
    const { password: p, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
});

app.get('/api/users/favorites', authenticateToken, (req, res) => {
    const user = users.find(u => u.username === req.user.sub);
    if (!user) return res.sendStatus(404);
    
    const favoriteEvents = events.filter(e => user.favorites.includes(e.id));
    res.json(favoriteEvents);
});

app.post('/api/users/favorites/:eventId', authenticateToken, (req, res) => {
    const user = users.find(u => u.username === req.user.sub);
    if (!user) return res.sendStatus(404);
    
    const eventId = parseInt(req.params.eventId);
    if (!user.favorites.includes(eventId)) {
        user.favorites.push(eventId);
    }
    
    res.sendStatus(200);
});

app.delete('/api/users/favorites/:eventId', authenticateToken, (req, res) => {
    const user = users.find(u => u.username === req.user.sub);
    if (!user) return res.sendStatus(404);
    
    const eventId = parseInt(req.params.eventId);
    user.favorites = user.favorites.filter(id => id !== eventId);
    
    res.sendStatus(200);
});

// --- ADMIN DATABASE DUMP ---
app.get('/api/admin/db', authenticateToken, requireAdmin, (req, res) => {
    res.json({
        users: users.map(u => { const { password, ...rest } = u; return rest; }),
        events,
        orders,
        reviews,
        polls,
        chatMessages,
        auditLogs,
        systemSettings,
        news,
        faq
    });
});

// --- NEWS ENDPOINTS ---
app.get('/api/news', (req, res) => {
    res.json(news);
});

app.get('/api/news/:id', (req, res) => {
    const item = news.find(n => n.id === parseInt(req.params.id));
    if (!item) return res.status(404).json({ message: 'News not found' });
    res.json(item);
});

app.post('/api/news', authenticateToken, requireAdmin, (req, res) => {
    const newItem = {
        id: news.length > 0 ? Math.max(...news.map(n => n.id)) + 1 : 1,
        ...req.body
    };
    news.push(newItem);
    addAuditLog('CREATE_NEWS', 'NEWS', newItem.id.toString(), req.user.sub, `Created news: ${newItem.title}`);
    res.status(201).json(newItem);
});

app.put('/api/news/:id', authenticateToken, requireAdmin, (req, res) => {
    const id = parseInt(req.params.id);
    const index = news.findIndex(n => n.id === id);
    if (index === -1) return res.status(404).json({ message: 'News not found' });

    news[index] = { ...news[index], ...req.body };
    addAuditLog('UPDATE_NEWS', 'NEWS', id.toString(), req.user.sub, `Updated news: ${news[index].title}`);
    res.json(news[index]);
});

app.delete('/api/news/:id', authenticateToken, requireAdmin, (req, res) => {
    const id = parseInt(req.params.id);
    const index = news.findIndex(n => n.id === id);
    if (index === -1) return res.status(404).json({ message: 'News not found' });

    const deletedItem = news.splice(index, 1)[0];
    addAuditLog('DELETE_NEWS', 'NEWS', id.toString(), req.user.sub, `Deleted news: ${deletedItem.title}`);
    res.json(deletedItem);
});

// --- FAQ ENDPOINTS ---
app.get('/api/faq', (req, res) => {
    res.json(faq);
});

app.post('/api/faq', authenticateToken, requireAdmin, (req, res) => {
    const newItem = {
        id: faq.length > 0 ? Math.max(...faq.map(f => f.id)) + 1 : 1,
        ...req.body
    };
    faq.push(newItem);
    addAuditLog('CREATE_FAQ', 'FAQ', newItem.id.toString(), req.user.sub, `Created FAQ: ${newItem.question}`);
    res.status(201).json(newItem);
});

app.put('/api/faq/:id', authenticateToken, requireAdmin, (req, res) => {
    const id = parseInt(req.params.id);
    const index = faq.findIndex(f => f.id === id);
    if (index === -1) return res.status(404).json({ message: 'FAQ not found' });

    faq[index] = { ...faq[index], ...req.body };
    addAuditLog('UPDATE_FAQ', 'FAQ', id.toString(), req.user.sub, `Updated FAQ: ${faq[index].question}`);
    res.json(faq[index]);
});

app.delete('/api/faq/:id', authenticateToken, requireAdmin, (req, res) => {
    const id = parseInt(req.params.id);
    const index = faq.findIndex(f => f.id === id);
    if (index === -1) return res.status(404).json({ message: 'FAQ not found' });

    const deletedItem = faq.splice(index, 1)[0];
    addAuditLog('DELETE_FAQ', 'FAQ', id.toString(), req.user.sub, `Deleted FAQ: ${deletedItem.question}`);
    res.json(deletedItem);
});

// --- ADMIN SYSTEM SETTINGS ---
app.get('/api/admin/settings', authenticateToken, requireAdmin, (req, res) => {
    res.json(systemSettings);
});

app.put('/api/admin/settings', authenticateToken, requireAdmin, (req, res) => {
    systemSettings = req.body;
    addAuditLog('UPDATE_SETTINGS', 'SYSTEM', 'SETTINGS', req.user.sub, 'Updated system settings');
    res.json(systemSettings);
});

// --- ADMIN USERS ---

app.get('/api/admin/users', authenticateToken, requireAdmin, (req, res) => {
    const { role, status, search } = req.query;
    
    let filteredUsers = users.map(u => {
        const { password, ...userWithoutPassword } = u;
        return userWithoutPassword;
    });

    if (role) {
        filteredUsers = filteredUsers.filter(u => u.role === role);
    }

    if (status) {
        if (status === 'blocked') {
             filteredUsers = filteredUsers.filter(u => u.securitySettings && u.securitySettings.isBlocked);
        } else if (status === 'active') {
             filteredUsers = filteredUsers.filter(u => !u.securitySettings || !u.securitySettings.isBlocked);
        }
    }

    if (search) {
        const s = search.toLowerCase();
        filteredUsers = filteredUsers.filter(u => 
            u.username.toLowerCase().includes(s) ||
            (u.fullName && u.fullName.toLowerCase().includes(s)) ||
            (u.email && u.email.toLowerCase().includes(s))
        );
    }
    
    res.json(filteredUsers);
});

app.put('/api/admin/users/:id', authenticateToken, requireAdmin, (req, res) => {
    const userId = parseInt(req.params.id);
    const user = users.find(u => u.id === userId);
    
    if (!user) return res.sendStatus(404);
    
    const { role, isBlocked, blockReason, blockExpiresAt, fullName, email, phone } = req.body;
    
    if (role) {
        addAuditLog('update_user_role', user.id, 'user', req.user.sub, `Role changed from ${user.role} to ${role}`);
        user.role = role;
    }
    
    if (isBlocked !== undefined) {
        if (!user.securitySettings) user.securitySettings = {};
        user.securitySettings.isBlocked = isBlocked;
        user.securitySettings.blockReason = blockReason || '';
        user.securitySettings.blockExpiresAt = blockExpiresAt || null;
        
        addAuditLog('update_user_status', user.id, 'user', req.user.sub, isBlocked ? `Blocked: ${blockReason}` : 'Unblocked');
    }
    
    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
});

app.post('/api/admin/users/bulk', authenticateToken, requireAdmin, (req, res) => {
    const { userIds, action, value } = req.body; // action: 'block', 'unblock', 'set_role'
    
    if (!userIds || !Array.isArray(userIds)) return res.status(400).json({message: 'Invalid userIds'});
    
    let count = 0;
    
    userIds.forEach(id => {
        const user = users.find(u => u.id === id);
        if (user) {
            if (action === 'block') {
                if (!user.securitySettings) user.securitySettings = {};
                user.securitySettings.isBlocked = true;
                count++;
            } else if (action === 'unblock') {
                if (user.securitySettings) user.securitySettings.isBlocked = false;
                count++;
            } else if (action === 'set_role') {
                user.role = value;
                count++;
            }
        }
    });
    
    addAuditLog('bulk_user_update', null, 'user', req.user.sub, `Bulk ${action} on ${count} users`);
    
    res.json({ message: `Processed ${count} users` });
});

app.get('/api/admin/audit-logs', authenticateToken, requireAdmin, (req, res) => {
    res.json(auditLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
});

// --- EVENTS ---

app.get('/api/events', (req, res) => {
  const { 
    search, 
    page = 0, 
    size = 6,
    genre,
    venue,
    startDate,
    endDate,
    minPrice,
    maxPrice,
    sort
  } = req.query;

  let filteredEvents = events;

  // Filtering
  if (search) {
    const s = search.toLowerCase();
    filteredEvents = filteredEvents.filter(e => 
      e.title.toLowerCase().includes(s) || 
      e.performers.toLowerCase().includes(s)
    );
  }

  if (genre) {
    filteredEvents = filteredEvents.filter(e => e.genre === genre);
  }

  if (venue) {
    filteredEvents = filteredEvents.filter(e => e.venue === venue);
  }

  if (startDate) {
    filteredEvents = filteredEvents.filter(e => new Date(e.date) >= new Date(startDate));
  }

  if (endDate) {
    filteredEvents = filteredEvents.filter(e => new Date(e.date) <= new Date(endDate));
  }

  if (minPrice) {
    filteredEvents = filteredEvents.filter(e => e.price >= parseInt(minPrice));
  }

  if (maxPrice) {
    filteredEvents = filteredEvents.filter(e => e.price <= parseInt(maxPrice));
  }

  // Sorting
  if (sort) {
    switch (sort) {
      case 'date_asc':
        filteredEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case 'date_desc':
        filteredEvents.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case 'price_asc':
        filteredEvents.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filteredEvents.sort((a, b) => b.price - a.price);
        break;
      case 'alpha_asc':
        filteredEvents.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'alpha_desc':
        filteredEvents.sort((a, b) => b.title.localeCompare(a.title));
        break;
    }
  }

  // Pagination logic
  const pageNum = parseInt(page);
  const sizeNum = parseInt(size);
  const startIndex = pageNum * sizeNum;
  const endIndex = startIndex + sizeNum;
  const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

  res.json({
    content: paginatedEvents,
    totalPages: Math.ceil(filteredEvents.length / sizeNum),
    totalElements: filteredEvents.length,
    number: pageNum,
    size: sizeNum
  });
});

app.get('/api/events/:id', (req, res) => {
  const event = events.find(e => e.id === parseInt(req.params.id));
  if (!event) return res.sendStatus(404);
  res.json(event);
});

app.get('/api/events/:id/seats', (req, res) => {
    // Generate a mock seating chart
    // 10 rows, 20 seats per row
    const rows = 10;
    const seatsPerRow = 20;
    const seats = [];
    
    for (let r = 1; r <= rows; r++) {
        for (let s = 1; s <= seatsPerRow; s++) {
            // Randomly occupy some seats (e.g., 20% occupied)
            const isOccupied = Math.random() < 0.2;
            let price = 1000;
            let category = 'Standard';
            
            if (r <= 3) {
                price = 3000;
                category = 'VIP';
            } else if (r <= 6) {
                price = 2000;
                category = 'Premium';
            }
            
            seats.push({
                row: r,
                number: s,
                isOccupied,
                price,
                category
            });
        }
    }
    res.json(seats);
});

app.get('/api/admin/events', authenticateToken, (req, res) => {
  const { status, search, genre, venue } = req.query;
  
  let filteredEvents = events;

  if (status) {
    filteredEvents = filteredEvents.filter(e => e.status === status);
  }

  if (search) {
    const s = search.toLowerCase();
    filteredEvents = filteredEvents.filter(e => 
      e.title.toLowerCase().includes(s) || 
      e.performers.toLowerCase().includes(s)
    );
  }

  if (genre) {
    filteredEvents = filteredEvents.filter(e => e.genre === genre);
  }

  if (venue) {
    filteredEvents = filteredEvents.filter(e => e.venue === venue);
  }

  // Sort by ID descending (newest first) by default
  filteredEvents.sort((a, b) => b.id - a.id);

  res.json(filteredEvents);
});

app.post('/api/admin/events', authenticateToken, (req, res) => {
  const newEvent = {
    id: events.length + 1,
    ...req.body
  };
  events.push(newEvent);
  res.json(newEvent);
});

app.put('/api/admin/events/:id', authenticateToken, (req, res) => {
    const event = events.find(e => e.id === parseInt(req.params.id));
    if (!event) return res.sendStatus(404);
    Object.assign(event, req.body);
    res.json(event);
});

app.delete('/api/admin/events/:id', authenticateToken, (req, res) => {
    const index = events.findIndex(e => e.id === parseInt(req.params.id));
    if (index !== -1) events.splice(index, 1);
    res.sendStatus(200);
});

// --- ORDERS ---

app.post('/api/orders', authenticateToken, (req, res) => {
  const { eventId, ticketsCount, seats, paymentMethod, status } = req.body;
  const event = events.find(e => e.id === eventId);
  
  if (!event) return res.status(404).json({ message: 'Event not found' });
  
  let count = ticketsCount;
  let totalPrice = 0;
  
  if (seats && seats.length > 0) {
      count = seats.length;
      totalPrice = seats.reduce((sum, seat) => sum + seat.price, 0);
  } else {
      totalPrice = event.price * (ticketsCount || 1);
      count = ticketsCount || 1;
  }
  
  if (event.availableTickets < count) return res.status(400).json({ message: 'Not enough tickets' });

  event.availableTickets -= count;
  
  const user = users.find(u => u.username === req.user.sub);
  if (!user) {
      return res.status(401).json({ message: 'User not found. Please relogin.' });
  }

  const newOrder = {
    id: orders.length + 1,
    user: { username: user.username },
    event: { ...event }, // Snapshot
    ticketsCount: count,
    seats: seats || [],
    totalPrice,
    paymentMethod: paymentMethod || 'online',
    status: status || 'paid', // 'paid', 'booked', 'cancelled', 'returned'
    ticketNumber: Math.random().toString(36).substring(2, 10).toUpperCase(),
    orderDate: new Date().toISOString(),
    bookingExpiresAt: status === 'booked' ? new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() : null
  };

  orders.push(newOrder);

  // Send email simulation
  if (user.email) {
      if (newOrder.status === 'paid') {
          const seatDetails = newOrder.seats.map(s => `Ряд ${s.row}, Место ${s.number}`).join('\n');
          const emailBody = `Здравствуйте, ${user.fullName || user.username}!

Спасибо за покупку билетов в Филармонию.

Ваш заказ: №${newOrder.ticketNumber}
Мероприятие: ${newOrder.event.title}
Дата: ${new Date(newOrder.event.date).toLocaleString()}
Место проведения: ${newOrder.event.venue}

Билеты:
${seatDetails}

Сумма: ${newOrder.totalPrice} руб.

Электронные билеты прикреплены к этому письму (симуляция).
Пожалуйста, предъявите их при входе.
`;
          sendEmail(user.email, `Билеты на ${newOrder.event.title}`, emailBody);
      } else if (newOrder.status === 'booked') {
          sendEmail(user.email, `Бронь заказа №${newOrder.ticketNumber}`, `Ваш заказ забронирован. Оплатите его до ${new Date(newOrder.bookingExpiresAt).toLocaleString()}.`);
      }
  }

  res.json(newOrder);
});

app.put('/api/orders/:id/cancel', authenticateToken, (req, res) => {
    const order = orders.find(o => o.id === parseInt(req.params.id));
    if (!order) return res.sendStatus(404);
    if (order.user.username !== req.user.sub) return res.sendStatus(403);
    
    order.status = 'cancelled';
    
    // Restore tickets count
    const event = events.find(e => e.id === order.event.id);
    if (event) {
        event.availableTickets += order.ticketsCount;
    }
    
    res.json(order);
});

app.put('/api/orders/:id/pay', authenticateToken, (req, res) => {
    const order = orders.find(o => o.id === parseInt(req.params.id));
    if (!order) return res.sendStatus(404);
    if (order.user.username !== req.user.sub) return res.sendStatus(403);
    
    order.status = 'paid';
    order.bookingExpiresAt = null;

    // Send email
    const user = users.find(u => u.username === req.user.sub);
    if (user && user.email) {
            const seatDetails = order.seats.map(s => `Ряд ${s.row}, Место ${s.number}`).join('\n');
            const emailBody = `Здравствуйте, ${user.fullName || user.username}!

Ваш заказ №${order.ticketNumber} успешно оплачен.

Мероприятие: ${order.event.title}
Дата: ${new Date(order.event.date).toLocaleString()}

Билеты:
${seatDetails}

Сумма: ${order.totalPrice} руб.
`;
            sendEmail(user.email, `Оплата заказа №${order.ticketNumber}`, emailBody);
    }

    res.json(order);
});

app.get('/api/orders', authenticateToken, (req, res) => {
  const userOrders = orders.filter(o => o.user.username === req.user.sub);
  res.json(userOrders);
});

app.delete('/api/orders/:id', authenticateToken, (req, res) => {
    const id = parseInt(req.params.id);
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) return res.status(404).json({ message: 'Order not found' });
    
    const order = orders[index];
    if (order.user.username !== req.user.sub) return res.status(403).json({ message: 'Forbidden' });
    
    // Restore tickets if order was valid
    if (order.status === 'paid' || order.status === 'booked') {
        const event = events.find(e => e.id === order.event.id);
        if (event) {
            event.availableTickets += order.ticketsCount;
        }
    }
    
    const deletedOrder = orders.splice(index, 1)[0];
    res.json(deletedOrder);
});

app.get('/api/admin/orders', authenticateToken, requireAdmin, (req, res) => {
    const { status, search, eventId, userId, date } = req.query;
    
    let filteredOrders = orders;

    if (status) {
        filteredOrders = filteredOrders.filter(o => o.status === status);
    }

    if (eventId) {
        filteredOrders = filteredOrders.filter(o => o.event.id === parseInt(eventId));
    }

    if (userId) { // Filter by user ID if passed, though usually we filter by search string
         // Assuming we might pass user ID
    }

    if (date) {
        // Simple date match (YYYY-MM-DD)
        filteredOrders = filteredOrders.filter(o => o.orderDate.startsWith(date));
    }

    if (search) {
        const s = search.toLowerCase();
        filteredOrders = filteredOrders.filter(o => 
            o.id.toString().includes(s) ||
            o.user.username.toLowerCase().includes(s) ||
            o.event.title.toLowerCase().includes(s) ||
            o.ticketNumber.toLowerCase().includes(s)
        );
    }

    // Sort by date desc
    filteredOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

    res.json(filteredOrders);
});

app.put('/api/admin/orders/:id', authenticateToken, requireAdmin, (req, res) => {
    const order = orders.find(o => o.id === parseInt(req.params.id));
    if (!order) return res.sendStatus(404);

    const { status } = req.body;
    const oldStatus = order.status;

    if (status) {
        order.status = status;
        
        // Handle logic for cancellations/returns
        if ((status === 'cancelled' || status === 'returned') && (oldStatus !== 'cancelled' && oldStatus !== 'returned')) {
             const event = events.find(e => e.id === order.event.id);
             if (event) {
                 event.availableTickets += order.ticketsCount;
             }
             order.bookingExpiresAt = null;
        }
        
        addAuditLog('update_order_status', order.id, 'order', req.user.sub, `Status changed from ${oldStatus} to ${status}`);
    }

    res.json(order);
});

app.post('/api/admin/orders/bulk', authenticateToken, requireAdmin, (req, res) => {
    const { orderIds, action } = req.body;
    
    if (!orderIds || !Array.isArray(orderIds)) return res.status(400).json({message: 'Invalid orderIds'});

    let count = 0;
    
    orderIds.forEach(id => {
        const order = orders.find(o => o.id === id);
        if (order) {
            if (action === 'cancel' && order.status !== 'cancelled' && order.status !== 'returned') {
                order.status = 'cancelled';
                const event = events.find(e => e.id === order.event.id);
                if (event) event.availableTickets += order.ticketsCount;
                count++;
            } else if (action === 'return' && order.status !== 'returned') {
                order.status = 'returned';
                 const event = events.find(e => e.id === order.event.id);
                if (event) event.availableTickets += order.ticketsCount;
                count++;
            }
        }
    });
    
    addAuditLog('bulk_order_update', null, 'order', req.user.sub, `Bulk ${action} on ${count} orders`);

    res.json({ message: `Processed ${count} orders` });
});

// --- REVIEWS ---
app.get('/api/events/:id/reviews', (req, res) => {
    const eventId = parseInt(req.params.id);
    const eventReviews = reviews.filter(r => r.eventId === eventId);
    res.json(eventReviews);
});

app.post('/api/events/:id/reviews', authenticateToken, (req, res) => {
    const eventId = parseInt(req.params.id);
    const { rating, comment } = req.body;
    const user = users.find(u => u.username === req.user.sub);
    
    const newReview = {
        id: reviews.length + 1,
        eventId,
        username: user.username,
        fullName: user.fullName || user.username,
        rating,
        comment,
        date: new Date().toISOString()
    };
    reviews.push(newReview);
    res.json(newReview);
});

// --- POLLS ---
app.get('/api/polls', (req, res) => {
    res.json(polls.filter(p => p.active));
});

app.post('/api/polls/:id/vote', authenticateToken, (req, res) => {
    const pollId = parseInt(req.params.id);
    const { optionId } = req.body;
    
    const poll = polls.find(p => p.id === pollId);
    if (!poll) return res.sendStatus(404);
    
    const option = poll.options.find(o => o.id === optionId);
    if (!option) return res.sendStatus(404);
    
    option.votes++;
    res.json(poll);
});

// --- CHAT ---
app.get('/api/chat/history', authenticateToken, (req, res) => {
    const userMessages = chatMessages.filter(m => m.username === req.user.sub);
    res.json(userMessages);
});

app.post('/api/chat/send', authenticateToken, (req, res) => {
    const { text } = req.body;
    const user = users.find(u => u.username === req.user.sub);
    
    const newMessage = {
        id: chatMessages.length + 1,
        sender: 'user',
        text,
        timestamp: new Date().toISOString(),
        username: user.username
    };
    chatMessages.push(newMessage);
    
    // Auto-reply mock
    setTimeout(() => {
        chatMessages.push({
            id: chatMessages.length + 1,
            sender: 'support',
            text: 'Спасибо за ваше сообщение! Оператор ответит вам в ближайшее время.',
            timestamp: new Date().toISOString(),
            username: user.username
        });
    }, 1000);
    
    res.json(newMessage);
});

// --- REPORTS ---

app.get('/api/admin/reports', authenticateToken, requireAdmin, (req, res) => {
    const { period, type, startDate, endDate } = req.query;
    
    // Helper to generate dates
    const generateDates = (days) => {
        const dates = [];
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            dates.push(d.toISOString().split('T')[0]);
        }
        return dates;
    };

    let data = [];
    const days = period === 'week' ? 7 : (period === 'month' ? 30 : 1);
    const dates = generateDates(days);

    if (type === 'sales') {
        data = dates.map(date => ({
            date,
            amount: Math.floor(Math.random() * 50000) + 10000,
            tickets: Math.floor(Math.random() * 50) + 10
        }));
    } else if (type === 'users') {
        data = dates.map(date => ({
            date,
            registrations: Math.floor(Math.random() * 10),
            active: Math.floor(Math.random() * 100) + 50
        }));
    } else if (type === 'events') {
        // Return top 5 events stats
        data = events.slice(0, 5).map(e => ({
            name: e.title,
            occupancy: Math.floor(Math.random() * 30) + 70, // 70-100%
            revenue: Math.floor(Math.random() * 100000) + 50000
        }));
    } else if (type === 'technical') {
        data = dates.map(date => ({
            date,
            requests: Math.floor(Math.random() * 5000) + 1000,
            errors: Math.floor(Math.random() * 50),
            latency: Math.floor(Math.random() * 100) + 20
        }));
    } else {
        // Summary dashboard data
        data = {
            totalSales: 1500000,
            totalTickets: 1200,
            newUsers: 45,
            activeEvents: events.filter(e => e.status === 'active').length,
            salesTrend: generateDates(7).map(d => ({ date: d, value: Math.floor(Math.random() * 50000) + 10000 })),
            popularEvents: events.slice(0, 3).map(e => ({ name: e.title, value: Math.floor(Math.random() * 100) }))
        };
    }

    res.json(data);
});

app.listen(PORT, () => {
  console.log(`Mock server running on http://localhost:${PORT}`);
});