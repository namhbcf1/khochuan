// backend/src/routes/staff.js
// Enterprise POS System - Staff Management with Gamification
// Handles staff CRUD, performance tracking, badges, challenges, and leaderboards

import { Router } from 'itty-router';
import { corsHeaders } from '../utils/cors';

// Tạo router mới cho Staff
const router = Router({ base: '/staff' });

// API endpoints cho Nhân viên
router.get('/', (request) => {
  return new Response(JSON.stringify({
    message: 'Staff API endpoints'
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
});

// API lấy thông tin cá nhân
router.get('/profile', (request) => {
  // Mock data - trong thực tế sẽ lấy từ database dựa trên token xác thực
  return new Response(JSON.stringify({
    id: 1,
    name: 'Nguyen Van Nhan Vien',
    email: 'nhanvien@khochuan.com',
    role: 'sales',
    hireDate: '2023-01-15',
    department: 'Sales',
    performanceStats: {
      totalSales: 145800000,
      ordersCompleted: 267,
      averageOrderValue: 545693,
      customerRating: 4.8
    },
    gamification: {
      level: 7,
      xp: 4250,
      nextLevelXp: 5000,
      badges: [
        { id: 1, name: 'Sales Star', description: 'Đạt doanh số 100tr trong 1 tháng', earnedAt: '2024-05-12' },
        { id: 2, name: 'Customer First', description: 'Duy trì rating 4.5+ trong 3 tháng', earnedAt: '2024-04-20' }
      ]
    }
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
});

// API lấy bảng xếp hạng
router.get('/leaderboard', (request) => {
  // Mock data - trong thực tế sẽ lấy từ database
  return new Response(JSON.stringify({
    leaderboard: [
      { id: 3, name: 'Tran Thi B', sales: 178500000, rank: 1, avatar: 'https://i.pravatar.cc/150?img=3' },
      { id: 1, name: 'Nguyen Van Nhan Vien', sales: 145800000, rank: 2, avatar: 'https://i.pravatar.cc/150?img=1' },
      { id: 5, name: 'Le Van D', sales: 132600000, rank: 3, avatar: 'https://i.pravatar.cc/150?img=5' },
      { id: 2, name: 'Pham Van C', sales: 98700000, rank: 4, avatar: 'https://i.pravatar.cc/150?img=2' },
      { id: 4, name: 'Hoang Thi E', sales: 87500000, rank: 5, avatar: 'https://i.pravatar.cc/150?img=4' }
    ],
    timeFrame: 'month',
    lastUpdated: '2024-07-01T00:00:00Z'
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
});

// API lấy thử thách đang hoạt động
router.get('/challenges/active', (request) => {
  // Mock data - trong thực tế sẽ lấy từ database
  return new Response(JSON.stringify({
    challenges: [
      {
        id: 1,
        title: 'Bán hàng đạt mốc',
        description: 'Đạt doanh số 50tr trong tuần này',
        reward: {
          xp: 500,
          badge: 'Weekly Warrior',
          bonusVND: 200000
        },
        progress: 76, // Phần trăm hoàn thành
        deadline: '2024-07-15T23:59:59Z'
      },
      {
        id: 2,
        title: 'Khách hàng hài lòng',
        description: 'Nhận 10 đánh giá 5 sao từ khách hàng',
        reward: {
          xp: 300,
          badge: 'Customer Champion'
        },
        progress: 40,
        deadline: '2024-07-31T23:59:59Z'
      }
    ]
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