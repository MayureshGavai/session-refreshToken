export const fetchDataController = async (req, res) => {
    try {
        const message = 'Data fetched successfully';
        res.json({ message });
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).json({ error: 'An error occurred while fetching data' });
    }
};
