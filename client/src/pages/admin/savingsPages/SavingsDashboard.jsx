import React, { useEffect, useState } from "react";
import { Table, Card, Button, Spin } from "antd";
import axios from "axios";

const SavingsDashboard = () => {
    const [savingsData, setSavingsData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch savings data from API
        const fetchSavingsData = async () => {
            try {
                const response = await axios.get("/api/savings"); // Replace with your API endpoint
                setSavingsData(response.data);
            } catch (error) {
                console.error("Error fetching savings data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSavingsData();
    }, []);

    const columns = [
        {
            title: "Account Holder",
            dataIndex: "accountHolder",
            key: "accountHolder",
        },
        {
            title: "Account Number",
            dataIndex: "accountNumber",
            key: "accountNumber",
        },
        {
            title: "Balance",
            dataIndex: "balance",
            key: "balance",
            render: (balance) => `$${balance.toFixed(2)}`,
        },
        {
            title: "Last Updated",
            dataIndex: "lastUpdated",
            key: "lastUpdated",
        },
    ];

    return (
        <div style={{ padding: "20px" }}>
            <Card title="Savings Dashboard" bordered={false}>
                {loading ? (
                    <Spin size="large" />
                ) : (
                    <Table
                        dataSource={savingsData}
                        columns={columns}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                    />
                )}
                <Button type="primary" style={{ marginTop: "20px" }}>
                    Add New Savings
                </Button>
            </Card>
        </div>
    );
};

export default SavingsDashboard;