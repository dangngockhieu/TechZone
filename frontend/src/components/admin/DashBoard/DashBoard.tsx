import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import type { BestSellerProduct } from "../../../interfaces";
import { FaBoxOpen, FaUsers, FaShoppingBag, FaMoneyBillWave, FaChartLine } from "react-icons/fa";
import { IoGameController } from "react-icons/io5";
import "./Dashboard.scss";
import { useEffect, useState } from "react";
import {
    countUsersForAdmin,
    countUsersThisMonthForAdmin,
    countProductsForAdmin,
    countOrdersThisMonth,
    getRevenueThisMonthForAdmin,
    getRevenueByMonthForAdmin,
    getTopSellingProduct
} from '../../../services/apiServices';
import { toast } from "react-toastify";

const Dashboard = () => {
    const [userCount, setUserCount] = useState<number>(0);
    const [usersThisMonth, setUsersThisMonth] = useState<number>(0);
    const [productCount, setProductCount] = useState<number>(0);
    const [orderCount, setOrderCount] = useState<number>(0);
    const [revenue, setRevenue] = useState<number>(0);
    const [chartData, setChartData] = useState<number[]>([]);
    const [growth, setGrowth] = useState<number>(0);
    const [bestSellers, setBestSellers] = useState<BestSellerProduct[]>([]);
    const [countPending, setCountPending] = useState<number>(0);
    const [countShipping, setCountShipping] = useState<number>(0);
    const [countCompleted, setCountCompleted] = useState<number>(0);

   

    // Pie chart trạng thái đơn hàng
    const orderStatus = [
        { name: "SHIPPING", value: countShipping, color: "#60a5fa"  },
        { name: "PENDING", value: countPending, color: "#fbbf24"  },
        { name: "COMPLETED", value: countCompleted, color: "#34d399"  },
    ];
    const orderStatusPercent = orderStatus.map(item => ({
    ...item,
    percent: orderCount ? ((item.value / orderCount) * 100).toFixed(1) : 0
}));



    // ====================================================

    const fetchCountUsers = async () => {
        try {
            const res = await countUsersForAdmin();
            if (res?.data?.success && res?.data?.count) {
                setUserCount(res?.data?.count || 0);
            }
        } catch {
            toast.error("Lỗi lấy số lượng người dùng");
        }
    };

    const fetchCountUsersThisMonth = async () => {
        try {
            const res = await countUsersThisMonthForAdmin();
            if (res?.data?.success && res?.data?.count) {
                setUsersThisMonth(res?.data?.count || 0);
            }
        } catch {
            toast.error("Lỗi lấy số lượng người dùng mới trong tháng");
        }
    };

    const fetchTopSellingProduct = async () => {
        try {
            const res = await getTopSellingProduct();
            if (res?.data?.success && res?.data?.products) {
                setBestSellers(res?.data?.products || []);
            }
        } catch{
            toast.error("Lỗi lấy sản phẩm bán chạy nhất");
        }
    };

    const fetchCountProducts = async () => {
        try {
            const res = await countProductsForAdmin();
            if (res?.data?.success && res?.data?.count) {
                setProductCount(res?.data?.count || 0);
            }
        } catch{
            toast.error("Lỗi lấy số lượng sản phẩm");
        }
    };

    const fetchCountOrders = async () => {
        try {
            const res = await countOrdersThisMonth();
            if (res?.data?.success && res?.data?.data) {
                setOrderCount(res?.data?.data?.count || 0);
                setCountPending(res?.data?.data?.countPending || 0);
                setCountShipping(res?.data?.data?.countShipping || 0);
                setCountCompleted(res?.data?.data?.countCompleted || 0);
            }
        } catch{
            toast.error("Lỗi lấy số lượng đơn hàng");
        }
    };

    const fetchRevenueThisMonth = async () => {
        try {
            const res = await getRevenueThisMonthForAdmin();
            if (res?.data?.success && res?.data?.data) {
                setRevenue(res?.data?.data?.revenue || 0);
                setGrowth(res?.data?.data?.growth || 0);
            }
        } catch{
            toast.error("Lỗi lấy doanh thu tháng này");
        }
    };

    const fetchRevenueByMonth = async () => {
        try {
            const res = await getRevenueByMonthForAdmin();
            if (res?.data?.success && Array.isArray(res?.data?.data?.revenueData)) {
                const data = res?.data?.data?.revenueData.map((value: number, index: number) => ({
                    month: `T${index + 1}`,
                    revenue: Number((value / 1_000_000).toFixed(1)),
                }));
                setChartData(data);
            }
        } catch{
            toast.error("Lỗi lấy dữ liệu biểu đồ doanh thu");
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([
                fetchCountUsers(),
                fetchCountUsersThisMonth(),
                fetchCountProducts(),
                fetchCountOrders(),
                fetchRevenueThisMonth(),
                fetchRevenueByMonth(),
                fetchTopSellingProduct()
            ]);
        };
        
        fetchData();
    }, []);

    const stats = [
        {
            title: "Tổng sản phẩm",
            value: productCount,
            icon: <FaBoxOpen />,
            color: "#6366f1",
        },
        {
            title: "Tổng người dùng",
            value: userCount,
            icon: <FaUsers />,
            color: "#10b981",
        },
        {
            title: "Đơn hàng tháng này",
            value: orderCount,
            icon: <FaShoppingBag />,
            color: "#f59e0b",
        },
        {
            title: "Doanh thu tháng này",
            value: `₫${(revenue / 1_000_000).toFixed(2)}M`,
            icon: <FaMoneyBillWave />,
            color: "#ef4444",
        },
        {
            title: "Tăng trưởng doanh thu",
            value: `${growth > 0 ? '+' : ''}${growth}%`,
            icon: <FaChartLine />,
            color: "#3b82f6",
        },
        {
            title: "User mới tháng này",
            value: usersThisMonth,
            icon: <FaUsers />,
            color: "#8b5cf6",
        },
    ];

    return (
        <div className="dashboard">
            <div className="header">
                <h2>
                    <IoGameController style={{ marginRight: 8 }} />
                    Bảng điều khiển
                </h2>
            </div>

            <div className="stats-grid">
                {stats.map((item, index) => (
                    <div className="stat-card" key={index} style={{ borderLeft: `6px solid ${item.color}` }}>
                        <div className="icon">{item.icon}</div>
                        <div className="info">
                            <p>{item.title}</p>
                            <h3>{item.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="chart-section">
                <h3>Xu hướng doanh thu 12 tháng</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} dot />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="chart-row">
                <div className="chart-box">
                    <h3>Top sản phẩm bán chạy</h3>
                    <ul className="best-seller">
                        {bestSellers.map((p) => (
                            <li key={p.id}>
                                <span>{p.name}</span>
                                <b>{p.sold} sold</b>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="chart-box">
                    <h3>Tỷ lệ trạng thái đơn hàng</h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                            <Pie
                                data={orderStatus}
                                dataKey="value"   
                                nameKey="name"
                                outerRadius={100}
                                label={({ percent }) => `${((percent ?? 0) * 100).toFixed(1)}%`} 
                            >
                                {orderStatus.map((item, idx) => (
                                    <Cell key={idx} fill={item.color} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>

                    <ul className="custom-legend" style={{ listStyle: "none", marginLeft: 20, padding: 0 }}>
                        {orderStatusPercent.map((item, idx) => (
                            <li key={idx} style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                                <span style={{
                                    display: "inline-block",
                                    width: 16,
                                    height: 16,
                                    backgroundColor: item.color,
                                    marginRight: 8
                                }}></span>
                                <span>{item.name}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

        </div>
    );
};

export default Dashboard;
