import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, RadialLinearScale } from 'chart.js';
import { Bar, Pie, Line, Doughnut, Radar } from 'react-chartjs-2';
import './style/home.css';
import { useState, useEffect} from 'react';
import axios from "axios";
import urlJoin from "url-join";
import { useParams } from 'react-router-dom';

const EXAMPLE_MAIN_URL = window.location.origin;
// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, RadialLinearScale);

const Home = () => {
    const [insightsData, setInsightsData] = useState([]);
    const [chatsData, setChatsData] = useState([]);
    const [productList, setProductList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { company_id } = useParams();


    const fetchInsightsData = async () => {
        const { data } = await axios.get(urlJoin(EXAMPLE_MAIN_URL, '/api/products/tags'), {
            headers: { "x-company-id": company_id }
        });
        return data;
    };

    const fetchProducts = async () => {
        const { data } = await axios.get(urlJoin(EXAMPLE_MAIN_URL, '/api/products'), {
            headers: { "x-company-id": company_id }
        });
        return data;
    };

    const fetchChats = async () => {
        const { data } = await axios.get(urlJoin(EXAMPLE_MAIN_URL, '/api/products/chats'), {
            headers: { "x-company-id": company_id }
        });
        return data;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [insights, chats, prods] = await Promise.all([fetchInsightsData(), fetchChats(), fetchProducts()]);
                setInsightsData(insights);
                setChatsData(chats);
                setProductList(prods);
                console.log("Fetched insights data:", insights);
                console.log("Fetched chats data:", chats);
                console.log("Fetched prods data:", prods);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {   
                setIsLoading(false);
            }
        }
        fetchData()
    }, [company_id]);

    // Helper function to extract keywords from queries
    const extractKeywords = (queries, keywordList) => {
        const keywordCount = {};
        keywordList.forEach(keyword => {
            keywordCount[keyword] = 0;
        });
        
        queries.forEach(chat => {
            const query = chat.query.toLowerCase();
            keywordList.forEach(keyword => {
                if (query.includes(keyword.toLowerCase())) {
                    keywordCount[keyword]++;
                }
            });
        });
        
        return keywordCount;
    };

    // Helper function to get top keywords dynamically
    const getTopKeywords = (queries, limit = 8) => {
        const wordCount = {};
        const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'this', 'that', 'these', 'those'];
        
        queries.forEach(chat => {
            const words = chat.query.toLowerCase().split(/\s+/);
            words.forEach(word => {
                const cleanWord = word.replace(/[^\w]/g, '');
                if (cleanWord.length > 2 && !commonWords.includes(cleanWord)) {
                    wordCount[cleanWord] = (wordCount[cleanWord] || 0) + 1;
                }
            });
        });
        
        return Object.entries(wordCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, limit)
            .reduce((obj, [key, value]) => {
                obj[key] = value;
                return obj;
            }, {});
    };

    // Calculate analytics
    const totalOrders = insightsData.length;
    const totalChats = chatsData.length;
    const totalProducts = productList.length;
    const averageProductsPerOrder = totalOrders > 0 ? (insightsData.reduce((sum, order) => sum + order.products.length, 0) / totalOrders).toFixed(2) : 0;

    // Data for Chart 1: Products per Order (Bar Chart)
    const productsPerOrderData = {
        labels: insightsData.map(order => order.orderId.slice(0, 8) + '...'),
        datasets: [
            {
                label: 'Number of Products',
                data: insightsData.map(order => order.products.length),
                backgroundColor: '#5756bb',
                borderColor: '#5756bb',
                borderWidth: 1,
            },
        ],
    };

    // Data for Chart 2: Dynamic Color Mentions (Pie Chart)
    const colorKeywords = ['blue', 'red', 'green', 'yellow', 'black', 'white', 'pink', 'purple', 'orange', 'brown'];
    const colorMentions = extractKeywords(chatsData, colorKeywords);
    const colorData = Object.entries(colorMentions).filter(([key, value]) => value > 0);
    
    const colorMentionsData = {
        labels: colorData.map(([color]) => color.charAt(0).toUpperCase() + color.slice(1)),
        datasets: [
            {
                label: 'Color Mentions',
                data: colorData.map(([, count]) => count),
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
                    '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
                    '#4BC0C0', '#FF6384'
                ],
                borderWidth: 1,
            },
        ],
    };

    // Data for Chart 3: Dynamic Style/Category Mentions (Doughnut Chart)
    const styleKeywords = ['korean', 'casual', 'formal', 'vintage', 'modern', 'classic', 'trendy', 'elegant', 'sporty', 'chic'];
    const styleMentions = extractKeywords(chatsData, styleKeywords);
    const styleData = Object.entries(styleMentions).filter(([key, value]) => value > 0);

    const styleMentionsData = {
        labels: styleData.map(([style]) => style.charAt(0).toUpperCase() + style.slice(1)),
        datasets: [
            {
                label: 'Style Mentions',
                data: styleData.map(([, count]) => count),
                backgroundColor: [
                    '#5756bb', '#8182da', '#a29bfe', '#6c5ce7',
                    '#fd79a8', '#e84393', '#00b894', '#00cec9',
                    '#0984e3', '#6c5ce7'
                ],
                borderWidth: 2,
            },
        ],
    };

    // Data for Chart 4: Cumulative Products Over Orders (Line Chart)
    let cumulativeProducts = 0;
    const cumulativeProductsData = {
        labels: insightsData.map(order => order.orderId.slice(0, 8) + '...'),
        datasets: [
            {
                label: 'Cumulative Products',
                data: insightsData.map(order => {
                    cumulativeProducts += order.products.length;
                    return cumulativeProducts;
                }),
                fill: false,
                borderColor: '#5756bb',
                backgroundColor: 'rgba(87, 86, 187, 0.1)',
                tension: 0.1,
                pointBackgroundColor: '#5756bb',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
            },
        ],
    };

    // Data for Chart 5: Top Search Keywords (Radar Chart)
    const topKeywords = getTopKeywords(chatsData, 6);
    const keywordRadarData = {
        labels: Object.keys(topKeywords),
        datasets: [
            {
                label: 'Keyword Frequency',
                data: Object.values(topKeywords),
                backgroundColor: 'rgba(87, 86, 187, 0.2)',
                borderColor: '#5756bb',
                borderWidth: 2,
                pointBackgroundColor: '#5756bb',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
            },
        ],
    };

    // Data for Chart 6: Orders vs Chats Comparison (Bar Chart)
    const comparisonData = {
        labels: ['Total Orders', 'Total Chats', 'Total Products'],
        datasets: [
            {
                label: 'Count',
                data: [totalOrders, totalChats, totalProducts],
                backgroundColor: ['#5756bb', '#8182da', '#a29bfe'],
                borderColor: ['#4a4398', '#6b6bc7', '#8b7ed8'],
                borderWidth: 2,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#333',
                },
            },
            title: {
                display: true,
                color: '#333',
            },
        },
        scales: {
            x: {
                ticks: {
                    color: '#333',
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)',
                },
            },
            y: {
                ticks: {
                    color: '#333',
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)',
                },
            },
        },
    };

    const radarOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#333',
                },
            },
            title: {
                display: true,
                color: '#333',
                text: 'Top Search Keywords',
            },
        },
        scales: {
            r: {
                beginAtZero: true,
                ticks: {
                    color: '#333',
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)',
                },
            },
        },
    };

    if (isLoading) {
        return (
            <div className="dashboard-container">
                <h1 className="dashboard-header">Analytics Dashboard</h1>
                <div className="loading-indicator">Loading data, please wait...</div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <h1 className="dashboard-header">Analytics Dashboard</h1>
            
            {/* Key Metrics Cards */}
            <div className="metrics-grid">
                <div className="metric-card">
                    <h3>Total Orders</h3>
                    <p className="metric-value">{totalOrders}</p>
                </div>
                <div className="metric-card">
                    <h3>Total Chats</h3>
                    <p className="metric-value">{totalChats}</p>
                </div>
                <div className="metric-card">
                    <h3>Total Products</h3>
                    <p className="metric-value">{totalProducts}</p>
                </div>
                <div className="metric-card">
                    <h3>Avg Products/Order</h3>
                    <p className="metric-value">{averageProductsPerOrder}</p>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="chart-card">
                    <h2>Products per Order</h2>
                    <div className="chart-wrapper">
                        <Bar
                            data={productsPerOrderData}
                            options={{
                                ...chartOptions,
                                plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Products per Order Distribution' } },
                            }}
                        />
                    </div>
                </div>

                <div className="chart-card">
                    <h2>Orders vs Chats vs Products</h2>
                    <div className="chart-wrapper">
                        <Bar
                            data={comparisonData}
                            options={{
                                ...chartOptions,
                                plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Platform Activity Overview' } },
                            }}
                        />
                    </div>
                </div>

                {colorData.length > 0 && (
                    <div className="chart-card">
                        <h2>Color Preferences in Queries</h2>
                        <div className="chart-wrapper">
                            <Pie
                                data={colorMentionsData}
                                options={{
                                    ...chartOptions,
                                    plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Popular Color Mentions' } },
                                }}
                            />
                        </div>
                    </div>
                )}

                {styleData.length > 0 && (
                    <div className="chart-card">
                        <h2>Style Preferences in Queries</h2>
                        <div className="chart-wrapper">
                            <Doughnut
                                data={styleMentionsData}
                                options={{
                                    ...chartOptions,
                                    plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Fashion Style Trends' } },
                                }}
                            />
                        </div>
                    </div>
                )}

                <div className="chart-card">
                    <h2>Cumulative Products Over Orders</h2>
                    <div className="chart-wrapper">
                        <Line
                            data={cumulativeProductsData}
                            options={{
                                ...chartOptions,
                                plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Product Growth Trend' } },
                            }}
                        />
                    </div>
                </div>

                {Object.keys(topKeywords).length > 0 && (
                    <div className="chart-card">
                        <h2>Top Search Keywords</h2>
                        <div className="chart-wrapper">
                            <Radar
                                data={keywordRadarData}
                                options={radarOptions}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;