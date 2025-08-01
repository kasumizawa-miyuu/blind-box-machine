const app = require('./app');
const http = require('http');

const port = process.env.PORT || 3000;
const server = http.createServer(app);

server.listen(port, () => {
    console.log(`Server running on port ${port}`);

    // 创建默认管理员账户（如果不存在）
    const User = require('./models/User');
    User.findOne({ role: 'admin' }).then(admin => {
        if (!admin) {
            const adminUsername = process.env.DEFAULT_ADMIN_USERNAME || 'admin';
            const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';

            const defaultAdmin = new User({
                username: adminUsername,
                password: adminPassword,
                role: 'admin'
            });
            defaultAdmin.save()
                .then(() => console.log('Default admin account created'))
                .catch(err => console.error('Failed to create admin:', err));
        }
    });
});