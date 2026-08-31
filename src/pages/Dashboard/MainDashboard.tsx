import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ResumeData, TemplateId, Job } from '../../types';
import { INITIAL_RESUME_DATA } from '../../data/mockData';
import { DashboardNavbar, NavTab } from '../../components/Layout/DashboardNavbar';
import { ResumeBuilder, AiPolishModal } from '../../components/ResumeBuilder';
import { AtsScoreDashboard } from '../../components/Ats/AtsScoreDashboard';
import { MockInterviewSimulator } from '../../components/Interviews/MockInterviewSimulator';
import { JobMatchingBoard } from '../../components/Jobs/JobMatchingBoard';
import { RecruitmentAnalyticsDashboard } from '../../components/Analytics/RecruitmentAnalyticsDashboard';
import { CareerCopilotDrawer } from '../../components/Copilot/CareerCopilotDrawer';
import { DevMailSmsSimulator } from '../../components/Verification/DevMailSmsSimulator';

export const MainDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('builder');
  const [resumeData, setResumeData] = useState<ResumeData>(() => {
    const saved = localStorage.getItem('active_resume_data');
    return saved ? JSON.parse(saved) : INITIAL_RESUME_DATA;
  });

  const [isPolishModalOpen, setIsPolishModalOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  // Sync to localStorage
  const handleUpdateResume = (updated: ResumeData) => {
    setResumeData(updated);
    localStorage.setItem('active_resume_data', JSON.stringify(updated));
  };

  const handleTemplateChange = (templateId: TemplateId) => {
    handleUpdateResume({ ...resumeData, templateId });
  };

  const handleColorChange = (themeColor: string) => {
    handleUpdateResume({ ...resumeData, themeColor });
  };

  const handleSaveVersion = () => {
    const versions = JSON.parse(localStorage.getItem('resume_versions') || '[]');
    versions.unshift({
      id: 'v-' + Date.now(),
      timestamp: new Date().toLocaleString(),
      title: resumeData.title,
      data: resumeData,
    });
    localStorage.setItem('resume_versions', JSON.stringify(versions.slice(0, 10)));
  };

  const handleSelectJobForCustomization = (job: Job) => {
    // Switch to ATS / Builder and preset title
    handleUpdateResume({
      ...resumeData,
      personal: {
        ...resumeData.personal,
        title: job.title,
      },
    });
    setActiveTab('ats');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Top Navbar */}
      <DashboardNavbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenCopilot={() => setIsCopilotOpen(true)}
      />

      {/* Main Tab Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'builder' && (
          <ResumeBuilder
            initialData={resumeData}
            onUpdateResume={handleUpdateResume}
            onSaveVersion={handleSaveVersion}
            onOpenPolishModal={() => setIsPolishModalOpen(true)}
          />
        )}

        {activeTab === 'ats' && (
          <AtsScoreDashboard
            resumeData={resumeData}
            onUpdateResume={handleUpdateResume}
            onSwitchToEditor={() => setActiveTab('builder')}
          />
        )}

        {activeTab === 'interview' && (
          <MockInterviewSimulator resumeData={resumeData} />
        )}

        {activeTab === 'jobs' && (
          <JobMatchingBoard
            resumeData={resumeData}
            onSelectJobForCustomization={handleSelectJobForCustomization}
          />
        )}

        {activeTab === 'analytics' && <RecruitmentAnalyticsDashboard />}
      </main>

      {/* Modals and Drawers */}
      <AiPolishModal
        isOpen={isPolishModalOpen}
        onClose={() => setIsPolishModalOpen(false)}
        resumeData={resumeData}
        onApplyPolishedData={handleUpdateResume}
      />

      <CareerCopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        resumeData={resumeData}
      />

      {/* Live Email & SMS Simulation Drawer */}
      <DevMailSmsSimulator />
    </div>
  );
};
