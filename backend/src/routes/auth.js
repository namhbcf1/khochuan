import { Router } from 'itty-router';
import { corsHeaders } from '../utils/cors';
import bcrypt from 'bcryptjs';

// Create router for auth routes
const router = Router({ base: '/auth' });

// Helper functions
async function hashPassword(password) {
  return await bcrypt.hash(password, 12);
}

async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

async function generateToken(user, secret) {
  // Tạo JWT token đơn giản
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  
  const payload = {
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // Hết hạn sau 24 giờ
  };
  
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  
  const signature = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  ).then(key => crypto.subtle.sign(
    { name: 'HMAC', hash: 'SHA-256' },
    key,
    new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`)
  )).then(buf => btoa(String.fromCharCode(...new Uint8Array(buf))));
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// Mảng người dùng mẫu để demo
const DEMO_USERS = [
  { 
    id: '1',
    email: 'admin@khochuan.com',
    password: '$2a$12$U40PJfIQZha2Dja4P9Xo3uX4JgQMtvAfIpP9xVlJJUrfTvDsV7Pha', // "password"
    name: 'Admin',
    role: 'admin'
  },
  { 
    id: '2',
    email: 'cashier@khochuan.com',
    password: '$2a$12$U40PJfIQZha2Dja4P9Xo3uX4JgQMtvAfIpP9xVlJJUrfTvDsV7Pha', // "password"
    name: 'Thu Ngân',
    role: 'cashier'
  },
  { 
    id: '3',
    email: 'staff@khochuan.com',
    password: '$2a$12$U40PJfIQZha2Dja4P9Xo3uX4JgQMtvAfIpP9xVlJJUrfTvDsV7Pha', // "password"
    name: 'Nhân Viên',
    role: 'staff'
  }
];

// LOGIN endpoint
router.post('/login', async (request, env) => {
  try {
    // Parse request body
    const body = await request.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Email và mật khẩu là bắt buộc'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
    
    // Tìm người dùng trong mảng demo hoặc DB trong môi trường thực tế
    const user = DEMO_USERS.find(u => u.email === email);
    
    if (!user) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Thông tin đăng nhập không hợp lệ'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
    
    // Xác thực mật khẩu
    const isValidPassword = await verifyPassword(password, user.password);
    
    if (!isValidPassword) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Thông tin đăng nhập không hợp lệ'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
    
    // Tạo token
    const token = await generateToken(user, env.JWT_SECRET || 'khochuan-secret-key');
    
    // Trả về thông tin người dùng (không bao gồm mật khẩu)
    const { password: _, ...userData } = user;
    
    return new Response(JSON.stringify({
      success: true,
      user: userData,
      token
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: 'Lỗi server, vui lòng thử lại sau'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
});

// Verify Token endpoint
router.post('/verify', async (request) => {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Token không được cung cấp'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
    
    // Giả lập xác thực token (trong môi trường thực tế sẽ giải mã và xác thực JWT)
    // Đối với demo, chúng ta giả định token hợp lệ và trả về thông tin người dùng
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Token hợp lệ'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
    
  } catch (error) {
    console.error('Token verification error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: 'Token không hợp lệ'
    }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
});

// Logout endpoint
router.post('/logout', async () => {
  // Đối với JWT, chúng ta thường không cần xử lý logout trên server
  // Nhưng có thể sử dụng endpoint này để ghi nhật ký hoặc thêm token vào blacklist
  
  return new Response(JSON.stringify({
    success: true,
    message: 'Đăng xuất thành công'
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
});

// Export router handler
export default {
  handle: (request, env, ctx) => router.handle(request, env, ctx)
};