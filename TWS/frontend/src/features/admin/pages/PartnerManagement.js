import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Avatar,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  TrendingUp,
  TrendingDown,
  People,
  AttachMoney,
  Assessment,
  Warning,
  CheckCircle,
  Refresh,
  Download,
  FilterList,
  MoreVert,
  Business,
  Email,
  Phone,
  LocationOn,
  Star,
  StarBorder
} from '@mui/icons-material';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend
);

const PartnerManagement = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [partnerDialogOpen, setPartnerDialogOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [editingPartner, setEditingPartner] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTier, setFilterTier] = useState('all');

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock data for demonstration
      const mockPartners = [
        {
          id: '1',
          companyName: 'Tech Solutions Inc',
          slug: 'tech-solutions',
          contactInfo: {
            primaryContact: {
              name: 'John Smith',
              email: 'john@techsolutions.com',
              phone: '+1-555-0123'
            }
          },
          partnership: {
            type: 'reseller',
            status: 'active',
            tier: 'gold',
            startDate: '2023-01-15'
          },
          commission: {
            rate: 25,
            totalRevenue: 125000,
            totalCommission: 31250,
            pendingCommission: 2500
          },
          performance: {
            totalTenants: 15,
            activeTenants: 12,
            monthlyRecurringRevenue: 8500,
            satisfactionScore: 4.8
          },
          whiteLabel: {
            enabled: true,
            branding: {
              primaryColor: '#1976d2',
              companyName: 'Tech Solutions Platform'
            }
          }
        },
        {
          id: '2',
          companyName: 'Digital Agency Pro',
          slug: 'digital-agency',
          contactInfo: {
            primaryContact: {
              name: 'Sarah Johnson',
              email: 'sarah@digitalagency.com',
              phone: '+1-555-0456'
            }
          },
          partnership: {
            type: 'reseller',
            status: 'active',
            tier: 'silver',
            startDate: '2023-03-20'
          },
          commission: {
            rate: 20,
            totalRevenue: 75000,
            totalCommission: 15000,
            pendingCommission: 1200
          },
          performance: {
            totalTenants: 8,
            activeTenants: 7,
            monthlyRecurringRevenue: 4200,
            satisfactionScore: 4.5
          },
          whiteLabel: {
            enabled: false
          }
        },
        {
          id: '3',
          companyName: 'Startup Consultants',
          slug: 'startup-consultants',
          contactInfo: {
            primaryContact: {
              name: 'Mike Chen',
              email: 'mike@startupconsultants.com',
              phone: '+1-555-0789'
            }
          },
          partnership: {
            type: 'referral',
            status: 'prospect',
            tier: 'bronze',
            startDate: null
          },
          commission: {
            rate: 15,
            totalRevenue: 0,
            totalCommission: 0,
            pendingCommission: 0
          },
          performance: {
            totalTenants: 0,
            activeTenants: 0,
            monthlyRecurringRevenue: 0,
            satisfactionScore: 0
          },
          whiteLabel: {
            enabled: false
          }
        }
      ];

      setPartners(mockPartners);
    } catch (err) {
      console.error('Error fetching partners:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPartner = () => {
    setEditingPartner(null);
    setPartnerDialogOpen(true);
  };

  const handleEditPartner = (partner) => {
    setEditingPartner(partner);
    setPartnerDialogOpen(true);
  };

  const handleViewPartner = (partner) => {
    setSelectedPartner(partner);
    setPartnerDialogOpen(true);
  };

  const handleDeletePartner = async (partnerId) => {
    if (window.confirm('Are you sure you want to delete this partner?')) {
      try {
        // In a real implementation, you would make an API call here
        setPartners(partners.filter(p => p.id !== partnerId));
      } catch (err) {
        console.error('Error deleting partner:', err);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'prospect': return 'warning';
      case 'suspended': return 'error';
      case 'terminated': return 'default';
      default: return 'default';
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'platinum': return 'primary';
      case 'gold': return 'warning';
      case 'silver': return 'default';
      case 'bronze': return 'secondary';
      default: return 'default';
    }
  };

  const filteredPartners = partners.filter(partner => {
    const matchesSearch = partner.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         partner.contactInfo.primaryContact.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || partner.partnership.status === filterStatus;
    const matchesTier = filterTier === 'all' || partner.partnership.tier === filterTier;
    
    return matchesSearch && matchesStatus && matchesTier;
  });

  // Chart data for partner performance
  const performanceChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Total Revenue',
        data: [45000, 52000, 48000, 61000, 55000, 67000],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1
      },
      {
        label: 'Commission Paid',
        data: [11250, 13000, 12000, 15250, 13750, 16750],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Partner Performance Overview'
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" action={
        <Button color="inherit" size="small" onClick={fetchPartners}>
          Retry
        </Button>
      }>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Partner Management
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => {/* Handle filter */}}
          >
            Filter
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={() => {/* Handle export */}}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddPartner}
          >
            Add Partner
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Partners
                  </Typography>
                  <Typography variant="h4">
                    {partners.length}
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    +2 this month
                  </Typography>
                </Box>
                <People color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Active Partners
                  </Typography>
                  <Typography variant="h4">
                    {partners.filter(p => p.partnership.status === 'active').length}
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    85% active rate
                  </Typography>
                </Box>
                <CheckCircle color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Revenue
                  </Typography>
                  <Typography variant="h4">
                    ${partners.reduce((sum, p) => sum + p.commission.totalRevenue, 0).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    +15.3% growth
                  </Typography>
                </Box>
                <AttachMoney color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Commission Paid
                  </Typography>
                  <Typography variant="h4">
                    ${partners.reduce((sum, p) => sum + p.commission.totalCommission, 0).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    +12.8% growth
                  </Typography>
                </Box>
                <TrendingUp color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Performance Chart */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Partner Performance Overview
          </Typography>
          <Box height={300}>
            <Line data={performanceChartData} options={chartOptions} />
          </Box>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search Partners"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by company name or contact..."
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="prospect">Prospect</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                  <MenuItem value="terminated">Terminated</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Tier</InputLabel>
                <Select
                  value={filterTier}
                  onChange={(e) => setFilterTier(e.target.value)}
                  label="Tier"
                >
                  <MenuItem value="all">All Tiers</MenuItem>
                  <MenuItem value="platinum">Platinum</MenuItem>
                  <MenuItem value="gold">Gold</MenuItem>
                  <MenuItem value="silver">Silver</MenuItem>
                  <MenuItem value="bronze">Bronze</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchPartners}
              >
                Refresh
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Partners Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Partners ({filteredPartners.length})
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Company</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Tier</TableCell>
                  <TableCell>Revenue</TableCell>
                  <TableCell>Commission</TableCell>
                  <TableCell>Tenants</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPartners.map((partner) => (
                  <TableRow key={partner.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {partner.companyName.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {partner.companyName}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {partner.slug}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {partner.contactInfo.primaryContact.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {partner.contactInfo.primaryContact.email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={partner.partnership.type}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={partner.partnership.status}
                        size="small"
                        color={getStatusColor(partner.partnership.status)}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={partner.partnership.tier}
                        size="small"
                        color={getTierColor(partner.partnership.tier)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        ${partner.commission.totalRevenue.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        ${partner.commission.totalCommission.toLocaleString()}
                      </Typography>
                      {partner.commission.pendingCommission > 0 && (
                        <Typography variant="caption" color="warning.main">
                          ${partner.commission.pendingCommission} pending
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {partner.performance.activeTenants}/{partner.performance.totalTenants}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={(partner.performance.activeTenants / partner.performance.totalTenants) * 100}
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewPartner(partner)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Partner">
                          <IconButton
                            size="small"
                            onClick={() => handleEditPartner(partner)}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Partner">
                          <IconButton
                            size="small"
                            onClick={() => handleDeletePartner(partner.id)}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Partner Dialog */}
      <Dialog
        open={partnerDialogOpen}
        onClose={() => setPartnerDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingPartner ? 'Edit Partner' : selectedPartner ? 'Partner Details' : 'Add New Partner'}
        </DialogTitle>
        <DialogContent>
          {selectedPartner && !editingPartner ? (
            <Box>
              {/* Partner Details View */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Company Information
                  </Typography>
                  <Box mb={2}>
                    <Typography variant="body2" color="textSecondary">
                      Company Name
                    </Typography>
                    <Typography variant="body1">
                      {selectedPartner.companyName}
                    </Typography>
                  </Box>
                  <Box mb={2}>
                    <Typography variant="body2" color="textSecondary">
                      Contact Person
                    </Typography>
                    <Typography variant="body1">
                      {selectedPartner.contactInfo.primaryContact.name}
                    </Typography>
                  </Box>
                  <Box mb={2}>
                    <Typography variant="body2" color="textSecondary">
                      Email
                    </Typography>
                    <Typography variant="body1">
                      {selectedPartner.contactInfo.primaryContact.email}
                    </Typography>
                  </Box>
                  <Box mb={2}>
                    <Typography variant="body2" color="textSecondary">
                      Phone
                    </Typography>
                    <Typography variant="body1">
                      {selectedPartner.contactInfo.primaryContact.phone}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Partnership Details
                  </Typography>
                  <Box mb={2}>
                    <Typography variant="body2" color="textSecondary">
                      Type
                    </Typography>
                    <Chip
                      label={selectedPartner.partnership.type}
                      color="primary"
                      size="small"
                    />
                  </Box>
                  <Box mb={2}>
                    <Typography variant="body2" color="textSecondary">
                      Status
                    </Typography>
                    <Chip
                      label={selectedPartner.partnership.status}
                      color={getStatusColor(selectedPartner.partnership.status)}
                      size="small"
                    />
                  </Box>
                  <Box mb={2}>
                    <Typography variant="body2" color="textSecondary">
                      Tier
                    </Typography>
                    <Chip
                      label={selectedPartner.partnership.tier}
                      color={getTierColor(selectedPartner.partnership.tier)}
                      size="small"
                    />
                  </Box>
                  <Box mb={2}>
                    <Typography variant="body2" color="textSecondary">
                      Commission Rate
                    </Typography>
                    <Typography variant="body1">
                      {selectedPartner.commission.rate}%
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Performance Metrics
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {selectedPartner.performance.totalTenants}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Total Tenants
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="success.main">
                          ${selectedPartner.commission.totalRevenue.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Total Revenue
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="warning.main">
                          ${selectedPartner.commission.totalCommission.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Commission Paid
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="info.main">
                          {selectedPartner.performance.satisfactionScore}/5
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Satisfaction
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Box>
              {/* Partner Form */}
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Company Name"
                    defaultValue={editingPartner?.companyName || ''}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Contact Person"
                    defaultValue={editingPartner?.contactInfo?.primaryContact?.name || ''}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    defaultValue={editingPartner?.contactInfo?.primaryContact?.email || ''}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    defaultValue={editingPartner?.contactInfo?.primaryContact?.phone || ''}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Partnership Type</InputLabel>
                    <Select
                      defaultValue={editingPartner?.partnership?.type || 'reseller'}
                      label="Partnership Type"
                    >
                      <MenuItem value="reseller">Reseller</MenuItem>
                      <MenuItem value="referral">Referral</MenuItem>
                      <MenuItem value="strategic">Strategic</MenuItem>
                      <MenuItem value="technology">Technology</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Status</InputLabel>
                    <Select
                      defaultValue={editingPartner?.partnership?.status || 'prospect'}
                      label="Status"
                    >
                      <MenuItem value="prospect">Prospect</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="suspended">Suspended</MenuItem>
                      <MenuItem value="terminated">Terminated</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Tier</InputLabel>
                    <Select
                      defaultValue={editingPartner?.partnership?.tier || 'bronze'}
                      label="Tier"
                    >
                      <MenuItem value="bronze">Bronze</MenuItem>
                      <MenuItem value="silver">Silver</MenuItem>
                      <MenuItem value="gold">Gold</MenuItem>
                      <MenuItem value="platinum">Platinum</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Commission Rate (%)"
                    type="number"
                    defaultValue={editingPartner?.commission?.rate || 20}
                    margin="normal"
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPartnerDialogOpen(false)}>
            Cancel
          </Button>
          {editingPartner || !selectedPartner ? (
            <Button variant="contained">
              {editingPartner ? 'Update' : 'Create'}
            </Button>
          ) : (
            <Button variant="contained" onClick={() => setEditingPartner(selectedPartner)}>
              Edit
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PartnerManagement;
