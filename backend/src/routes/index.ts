import { Router } from 'express';
import multer from 'multer';
import { AuthController } from '../controllers/authController.js';
import { CandidateController } from '../controllers/candidateController.js';
import { JobsController } from '../controllers/jobsController.js';
import { MatchesController } from '../controllers/matchesController.js';
import { AdminController } from '../controllers/adminController.js';
import { GdprController } from '../controllers/gdprController.js';
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
router.get('/jobs/saved', authenticate, JobsController.getSavedJobs);
router.get('/jobs/:id', JobsController.getById);
router.post('/jobs/:id/save', authenticate, JobsController.saveJob);
router.delete('/jobs/:id/save', authenticate, JobsController.unsaveJob);

// 4. AI Matching Routes
router.get('/matches', authenticate, MatchesController.getMatches);
router.post('/matches/recalculate/:jobId', authenticate, MatchesController.recalculate);

// 5. Admin Control Center Routes
router.get('/admin/kpis', AdminController.getKpis);
router.get('/admin/sources', AdminController.getSources);
router.patch('/admin/sources/:id/toggle', AdminController.toggleSource);
router.post('/admin/sources/:id/trigger', AdminController.triggerSource);
router.get('/admin/weights', AdminController.getWeights);
router.put('/admin/weights', AdminController.updateWeights);

// 6. GDPR & Compliance Routes
router.get('/gdpr/export', authenticate, GdprController.exportData);
router.post('/gdpr/consent', authenticate, GdprController.recordConsent);
router.delete('/gdpr/delete-account', authenticate, GdprController.deleteAccount);

export default router;
