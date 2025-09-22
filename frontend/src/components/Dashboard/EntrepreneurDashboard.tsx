import React, { useEffect, useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Box,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert,
} from '@mui/material';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { entrepreneurAPI } from '../../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface DashboardData {
  entrepreneur: any;
  progress: {
    percentage: number;
    currentStage: string;
    trainingHours: number;
  };
  investment: {
    totalHours: number;
    costPerHour: number;
    totalInvestment: number;
  };
  upcomingMeetings: any[];
}

const EntrepreneurDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await entrepreneurAPI.getDashboard();
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getStageDisplayName = (stage: string) => {
    const stageNames: { [key: string]: string } = {
      ideacion: 'Ideación',
      preincubacion: 'Pre-incubación',
      incubacion: 'Incubación',
      aceleracion: 'Aceleración',
      consolidacion: 'Consolidación'
    };
    return stageNames[stage] || stage;
  };

  const progressData = {
    labels: ['Completado', 'Pendiente'],
    datasets: [
      {
        data: [
          dashboardData?.progress.percentage || 0,
          100 - (dashboardData?.progress.percentage || 0)
        ],
        backgroundColor: ['#4caf50', '#e0e0e0'],
        borderWidth: 0,
      },
    ],
  };

  if (loading) {
    return <Box>Cargando...</Box>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!dashboardData) {
    return <Alert severity="warning">No se encontraron datos</Alert>;
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Progreso del Emprendimiento
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Etapa actual: {getStageDisplayName(dashboardData.progress.currentStage)}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={dashboardData.progress.percentage}
                sx={{ mt: 1, height: 8, borderRadius: 4 }}
              />
              <Typography variant="body2" sx={{ mt: 1 }}>
                {dashboardData.progress.percentage}% completado
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Progreso Visual
            </Typography>
            <Box sx={{ height: 200, display: 'flex', justifyContent: 'center' }}>
              <Doughnut 
                data={progressData} 
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
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
              Horas de Capacitación
            </Typography>
            <Typography variant="h4" color="primary">
              {dashboardData.progress.trainingHours}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              horas acumuladas
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Inversión total: ${dashboardData.investment.totalInvestment.toLocaleString()} COP
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Próximas Reuniones
            </Typography>
            {dashboardData.upcomingMeetings.length > 0 ? (
              <List dense>
                {dashboardData.upcomingMeetings.map((meeting, index) => (
                  <ListItem key={index} divider>
                    <ListItemText
                      primary={meeting.title}
                      secondary={
                        <Box>
                          <Typography variant="body2">
                            {new Date(meeting.startTime).toLocaleDateString()} -{' '}
                            {new Date(meeting.startTime).toLocaleTimeString()}
                          </Typography>
                          <Chip
                            label={meeting.status}
                            size="small"
                            color="primary"
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No hay reuniones programadas
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Información del Emprendimiento
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Nombre del Emprendedor
                </Typography>
                <Typography variant="body1">
                  {dashboardData.entrepreneur.user?.name}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Población Vulnerable
                </Typography>
                <Chip
                  label={dashboardData.entrepreneur.isVulnerablePopulation ? 'Sí' : 'No'}
                  color={dashboardData.entrepreneur.isVulnerablePopulation ? 'primary' : 'default'}
                  size="small"
                />
              </Grid>
              {dashboardData.entrepreneur.assignedAlly && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Aliado Asignado
                  </Typography>
                  <Typography variant="body1">
                    {dashboardData.entrepreneur.assignedAlly.name}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default EntrepreneurDashboard;