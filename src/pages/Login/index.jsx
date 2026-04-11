import React, { useState } from 'react';
import authApi from '../../api/authApi';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Gọi API đăng nhập khớp với BE anh đã gửi
            const response = await authApi.login({ username, password });
            
            // Code 1000 là thành công theo chuẩn BE của anh
            if (response.code === 1000) {
                // Lưu token vào máy để các module sau sử dụng
                localStorage.setItem('token', response.result.token);
                alert("Đăng nhập thành công!");
                window.location.href = '/employee'; 
            }
        } catch (error) {
            // Lấy thông báo lỗi từ GlobalExceptionHandler của BE
            alert("Đăng nhập thất bại! Kiểm tra tài khoản hoặc Server BE.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <form onSubmit={handleLogin} style={styles.form}>
                <h2 style={{color: '#333', marginBottom: '20px'}}>HỆ THỐNG QLNV</h2>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Tài khoản:</label>
                    <input 
                        style={styles.input}
                        type="text" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        placeholder="Nhập email hoặc username"
                        required 
                    />
                </div>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Mật khẩu:</label>
                    <input 
                        style={styles.input}
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder="Nhập mật khẩu"
                        required 
                    />
                </div>
                <button type="submit" disabled={loading} style={styles.button}>
                    {loading ? 'Đang xác thực...' : 'ĐĂNG NHẬP'}
                </button>
                <div style={{marginTop: '15px', fontSize: '13px', color: '#666'}}>
                    <p>Tài khoản mẫu: <b>admin2</b></p>
                    <p>Mật khẩu: <b>Password@123</b></p>
                </div>
            </form>
        </div>
    );
};

// Phần trang trí giao diện đơn giản cho anh dễ nhìn
const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#e9ecef' },
    form: { padding: '40px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '400px', textAlign: 'center' },
    inputGroup: { marginBottom: '20px', textAlign: 'left' },
    label: { display: 'block', marginBottom: '5px', fontWeight: 'bold' },
    input: { width: '100%', padding: '12px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '6px' },
    button: { width: '100%', padding: '12px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }
};

export default Login;