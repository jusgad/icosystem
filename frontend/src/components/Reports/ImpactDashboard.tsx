import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Alert,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  TrendingUp,
  People,
  School,
  Assignment,
  Download,
  Visibility,
} from '@mui/icons-material';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface ImpactMetrics {
  totalEntrepreneurs: number;
  vulnerablePopulationCount: number;
  vulnerablePopulationPercentage: number;
  totalTrainingHours: number;
  totalInvestment: number;
  totalMeetings: number;
  completedMeetings: number;
  completionRate: number;
  totalDocuments: number;
  publicDocuments: number;
  baseCostPerSession: number;
  currency: string;
}

interface StageDistribution {
  [key: string]: number;
}

interface Entrepreneur {
  id: string;
  name: string;
  email: string;
  currentStage: string;
  progressPercentage: number;
  trainingHours: number;
  isVulnerablePopulation: boolean;
  assignedAlly?: any;
  createdAt: string;
}

const ImpactDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<ImpactMetrics | null>(null);
  const [stageDistribution, setStageDistribution] = useState<StageDistribution>({});
  const [directory, setDirectory] = useState<Entrepreneur[]>([]);
  const [currency, setCurrency] = useState('COP');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [currency]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch impact metrics
      const metricsResponse = await fetch(`/api/reports/impact-metrics?currency=${currency}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      const metricsData = await metricsResponse.json();
      setMetrics(metricsData.metrics);
      setStageDistribution(metricsData.stageDistribution);

      // Fetch entrepreneur directory
      const directoryResponse = await fetch('/api/reports/entrepreneur-directory', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      const directoryData = await directoryResponse.json();
      setDirectory(directoryData.directory);

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const downloadProgressReport = async () => {
    try {
      const response = await fetch('/api/reports/progress-report?format=csv', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'reporte-progreso.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  const getStageLabel = (stage: string) => {
    const labels: { [key: string]: string } = {
      ideacion: 'Ideación',
      preincubacion: 'Pre-incubación',
      incubacion: 'Incubación',
      aceleracion: 'Aceleración',
      consolidacion: 'Consolidación'
    };
    return labels[stage] || stage;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Chart data
  const stageChartData = {
    labels: Object.keys(stageDistribution).map(getStageLabel),
    datasets: [
      {
        data: Object.values(stageDistribution),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF'
        ],
        borderWidth: 0,
      },
    ],
  };

  const vulnerablePopulationData = {
    labels: ['Población Vulnerable', 'Población General'],
    datasets: [
      {
        data: [
          metrics?.vulnerablePopulationCount || 0,
          (metrics?.totalEntrepreneurs || 0) - (metrics?.vulnerablePopulationCount || 0)
        ],
        backgroundColor: ['#FF6384', '#36A2EB'],
        borderWidth: 0,
      },
    ],
  };

  if (loading) {
    return (
      <Box>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Cargando dashboard de impacto...</Typography>
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Dashboard de Impacto</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Moneda</InputLabel>
            <Select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              label="Moneda"
            >
              <MenuItem value="COP">COP</MenuItem>
              <MenuItem value="USD">USD</MenuItem>
              <MenuItem value="EUR">EUR</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={downloadProgressReport}
          >
            Descargar Reporte
          </Button>
        </Box>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <People color="primary" />
                <Box>
                  <Typography variant="h4">{metrics?.totalEntrepreneurs}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Emprendedores
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TrendingUp color="success" />
                <Box>
                  <Typography variant="h4">{metrics?.vulnerablePopulationPercentage}%</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Población Vulnerable
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <School color="warning" />
                <Box>
                  <Typography variant="h4">{metrics?.totalTrainingHours}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Horas de Capacitación
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Assignment color="info" />
                <Box>
                  <Typography variant="h6">
                    {formatCurrency(metrics?.totalInvestment || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Inversión Total
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Distribución por Etapas
              </Typography>
              <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                <Doughnut 
                  data={stageChartData}
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Población Vulnerable vs General
              </Typography>
              <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                <Doughnut 
                  data={vulnerablePopulationData}
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Additional Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Reuniones
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Total</Typography>
                <Typography variant="body2">{metrics?.totalMeetings}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Completadas</Typography>
                <Typography variant="body2">{metrics?.completedMeetings}</Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={metrics?.completionRate || 0} 
                sx={{ mt: 1 }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Tasa de Completitud: {metrics?.completionRate}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Documentos
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Total</Typography>
                <Typography variant="body2">{metrics?.totalDocuments}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Públicos</Typography>
                <Typography variant="body2">{metrics?.publicDocuments}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Costo Base
              </Typography>
              <Typography variant="h4" color="primary">
                {formatCurrency(metrics?.baseCostPerSession || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Por sesión de capacitación (10 emprendedores)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Entrepreneur Directory */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Directorio de Emprendedores
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Etapa</TableCell>
                  <TableCell align="center">Progreso</TableCell>
                  <TableCell align="center">Horas</TableCell>
                  <TableCell align="center">Población Vulnerable</TableCell>
                  <TableCell>Fecha de Registro</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {directory.slice(0, 10).map((entrepreneur) => (
                  <TableRow key={entrepreneur.id}>
                    <TableCell>{entrepreneur.name}</TableCell>
                    <TableCell>
                      <Chip 
                        label={getStageLabel(entrepreneur.currentStage)} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell align="center">
                      {entrepreneur.progressPercentage}%
                    </TableCell>
                    <TableCell align="center">
                      {entrepreneur.trainingHours}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={entrepreneur.isVulnerablePopulation ? 'Sí' : 'No'}
                        color={entrepreneur.isVulnerablePopulation ? 'primary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(entrepreneur.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {directory.length > 10 && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button
                startIcon={<Visibility />}
                onClick={() => {/* Navigate to full directory */}}
              >
                Ver todos los emprendedores ({directory.length})
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ImpactDashboard;