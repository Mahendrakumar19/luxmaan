import { Request, Response } from 'express';
import crypto from 'crypto';
import { db } from '../db/store.js';
import { JobApplication, ApplicationStatus } from '../types/index.js';

export class ApplicationsController {
  static getApplications(req: Request, res: Response) {
    const userId = req.user!.id;
    const list: JobApplication[] = [];

    for (const app of db.applications.values()) {
      if (app.userId === userId) {
        list.push(app);
      }
    }

    list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    res.json({ success: true, data: list });
  }

  static createApplication(req: Request, res: Response) {
    const userId = req.user!.id;
    const {
      companyName,
      jobTitle,
      locationCity,
      salary,
      applicationUrl,
      status = 'Interested',
      notes,
      interviewDate,
      jobId
    } = req.body;

    if (!companyName || !jobTitle) {
      res.status(400).json({ success: false, message: 'Company name and job title are required.' });
      return;
    }

    const newApp: JobApplication = {
      id: `app-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      userId,
      jobId,
      companyName: companyName.trim(),
      jobTitle: jobTitle.trim(),
      locationCity: locationCity ? locationCity.trim() : undefined,
      salary: salary ? salary.trim() : undefined,
      applicationUrl: applicationUrl ? applicationUrl.trim() : undefined,
      status: (status as ApplicationStatus) || 'Interested',
      notes: notes ? notes.trim() : undefined,
      interviewDate: interviewDate || undefined,
      appliedDate: status === 'Applied' || status === 'Interview' || status === 'Offer' ? new Date().toISOString() : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.applications.set(newApp.id, newApp);

    res.status(201).json({
      success: true,
      data: newApp,
      message: 'Job application tracked successfully.'
    });
  }

  static updateApplication(req: Request, res: Response) {
    const userId = req.user!.id;
    const id = req.params.id as string;
    const app = db.applications.get(id);

    if (!app || app.userId !== userId) {
      res.status(404).json({ success: false, message: 'Application not found.' });
      return;
    }

    const { status, notes, interviewDate, salary, locationCity, applicationUrl, jobTitle, companyName } = req.body;

    if (status) {
      app.status = status as ApplicationStatus;
      if (status === 'Applied' && !app.appliedDate) {
        app.appliedDate = new Date().toISOString();
      }
    }
    if (notes !== undefined) app.notes = notes;
    if (interviewDate !== undefined) app.interviewDate = interviewDate;
    if (salary !== undefined) app.salary = salary;
    if (locationCity !== undefined) app.locationCity = locationCity;
    if (applicationUrl !== undefined) app.applicationUrl = applicationUrl;
    if (jobTitle !== undefined) app.jobTitle = jobTitle;
    if (companyName !== undefined) app.companyName = companyName;

    app.updatedAt = new Date().toISOString();
    db.applications.set(id, app);

    res.json({ success: true, data: app, message: 'Application updated.' });
  }

  static deleteApplication(req: Request, res: Response) {
    const userId = req.user!.id;
    const id = req.params.id as string;
    const app = db.applications.get(id);

    if (!app || app.userId !== userId) {
      res.status(404).json({ success: false, message: 'Application not found.' });
      return;
    }

    db.applications.delete(id);
    res.json({ success: true, message: 'Application removed from tracker.' });
  }
}
