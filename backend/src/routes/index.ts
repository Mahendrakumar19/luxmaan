import { Router } from 'express';
import multer from 'multer';
import { AuthController } from '../controllers/authController.js';
import { CandidateController } from '../controllers/candidateController.js';
import { JobsController } from '../controllers/jobsController.js';
import { MatchesController } from '../controllers/matchesController.js';
import { AdminController } from '../controllers/adminController.js';
import { GdprController } from '../controllers/gdprController.js';
import { ApplicationsController } from '../controllers/applicationsController.js';
import { DocumentsController } from '../controllers/documentsController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit
const router = Router();

// 1. Auth Routes
router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);
router.get('/auth/me', authenticate, AuthController.me);

// 2. Candidate Routes
router.get('/candidate/profile', authenticate, CandidateController.getProfile);
router.put('/candidate/profile', authenticate, CandidateController.updateProfile);
router.post('/candidate/resumes/upload', authenticate, upload.single('file'), CandidateController.uploadResume);
router.get('/candidate/resumes', authenticate, CandidateController.getResumes);
router.delete('/candidate/resumes/:resumeId', authenticate, CandidateController.deleteResume);

// 3. Job Discovery Routes
router.get('/jobs', JobsController.search);
router.post('/jobs/ingest', JobsController.ingestBatch);
router.post('/jobs/sync-live', JobsController.syncLiveSources);
router.get('/jobs/saved', authenticate, JobsController.getSavedJobs);
router.get('/jobs/:id', JobsController.getById);
router.post('/jobs/:id/save', authenticate, JobsController.saveJob);
router.delete('/jobs/:id/save', authenticate, JobsController.unsaveJob);

// 4. AI Matching Routes
router.get('/matches', authenticate, MatchesController.getMatches);
router.post('/matches/recalculate/:jobId', authenticate, MatchesController.recalculate);

// 5. Admin Control Center Routes (Strict RBAC Protection)
router.get('/admin/kpis', authenticate, requireRole(['Admin', 'SuperAdmin']), AdminController.getKpis);
router.get('/admin/sources', authenticate, requireRole(['Admin', 'SuperAdmin']), AdminController.getSources);
router.patch('/admin/sources/:id/toggle', authenticate, requireRole(['Admin', 'SuperAdmin']), AdminController.toggleSource);
router.post('/admin/sources/:id/trigger', authenticate, requireRole(['Admin', 'SuperAdmin']), AdminController.triggerSource);
router.get('/admin/weights', authenticate, requireRole(['Admin', 'SuperAdmin']), AdminController.getWeights);
router.put('/admin/weights', authenticate, requireRole(['Admin', 'SuperAdmin']), AdminController.updateWeights);

// 6. Application Tracker (Kanban Board) Routes
router.get('/candidate/applications', authenticate, ApplicationsController.getApplications);
router.post('/candidate/applications', authenticate, ApplicationsController.createApplication);
router.patch('/candidate/applications/:id', authenticate, ApplicationsController.updateApplication);
router.delete('/candidate/applications/:id', authenticate, ApplicationsController.deleteApplication);

// 6b. Credibility Score & Tailored CV / Cover Letter Generator Routes
router.get('/candidate/credibility', authenticate, DocumentsController.getCredibilityScore);
router.post('/documents/generate', authenticate, DocumentsController.generateTailoredDocument);

// 7. GDPR & Compliance Routes
router.get('/gdpr/export', authenticate, GdprController.exportData);
router.post('/gdpr/consent', authenticate, GdprController.recordConsent);
router.delete('/gdpr/delete-account', authenticate, GdprController.deleteAccount);

// 8. Health & Database Diagnostic Routes
router.get('/health', async (req, res) => {
  const { checkDatabaseConnection } = await import('../db/connection.js');
  const dbStatus = await checkDatabaseConnection();
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: dbStatus
  });
});

router.get('/health/db', async (req, res) => {
  const { checkDatabaseConnection } = await import('../db/connection.js');
  const dbStatus = await checkDatabaseConnection();
  res.status(dbStatus.isConnected ? 200 : 503).json(dbStatus);
});

export default router;

