# Reddit GEO Agent - Enterprise Tabbed Workflow Redesign

## Overview
Transform the Reddit GEO Agent into an enterprise-grade, stage-based workflow with tabbed navigation, progress tracking, and comprehensive reporting capabilities.

## Architecture

### Current State
- Single-page layout with all stages visible simultaneously
- Stage 1 intelligence panels appear after scan
- Stages 2-3 are static dummy data tables
- No clear progression or completion tracking

### Target State - 4-Tab Workflow

#### Tab 1: Business Intelligence (Stage 1)
**Purpose:** Define business context and view market analysis results

**Content:**
- Business context input form (website, region, competitors, description, ideal buyer, goal)
- "Run Opportunity Scan" button
- After completion, displays:
  - Opportunity Intelligence Card (4-factor breakdown: Market Demand, Competition, Reddit Presence, Conversion)
  - Strategic reasoning panel
  - Persona Strategy Card (demographics, pain points, engagement approach)
  - Priority Keywords Card (high-intent clusters with badges)
  - Subreddit Targets Card (9 communities with confidence scores)

**State Management:**
- `stage1Complete` = true after successful analysis
- Auto-navigate to Stage 2 after 1.5s
- Stores `analysisData` for downstream use

#### Tab 2: Subreddit Discovery (Stage 2)
**Purpose:** View ranked communities and apply filters

**Content:**
- Subreddit Intelligence Table
  - Columns: Subreddit, Members, Activity, Buyer Intent, Risk, Lead Probability, Best Format
  - Data from Stage 2 API call (`/scan-subreddits`)
- Interactive filters:
  - Minimum lead probability slider
  - Risk tolerance selector
  - Activity level filter
- Enhanced visualization:
  - Color-coded risk indicators
  - Sortable columns
  - Export to CSV option

**State Management:**
- `stage2Complete` = true after subreddit scan
- Auto-navigate to Stage 3 after 1.5s
- Unlocked only when `stage1Complete` = true

#### Tab 3: Thread Targeting (Stage 3)
**Purpose:** Identify opportunities and generate AI comments

**Content:**
- Live Thread Opportunities Table
  - Columns: Subreddit, Title, Intent, Lead Score, Risk Score, Hours Ago
  - Click row to open comment generator drawer
- Filters:
  - Subreddit selector
  - Intent type filter (Question, Comparison, Complaint, Recommendation)
  - Last 24 hours toggle
- Comment Generator Drawer (Sheet):
  - Thread details
  - Tone selector (Professional, Casual, Technical)
  - Length selector (Short, Medium, Long)
  - Variant buttons (Authority, Practical, Educational)
  - Generated comment preview
  - Copy to clipboard button

**State Management:**
- `stage3Complete` = true when user generates first comment
- Unlocked only when `stage2Complete` = true

#### Tab 4: Executive Report
**Purpose:** Comprehensive summary and export

**Content:**
- Executive Summary Card
  - Overall opportunity score
  - Primary niche identified
  - Top 3 recommended subreddits
  - Key persona insights
- Performance Metrics Grid
  - Market demand score
  - Competition level
  - Reddit presence score
  - Conversion potential
- Strategic Recommendations
  - Engagement strategy summary
  - Risk tolerance guidance
  - Content format recommendations
- Export Options
  - **Download PDF Report** - Formatted executive summary
  - **Download JSON** - Complete analysis data
  - **Copy Summary** - Markdown formatted text

**State Management:**
- Unlocked only when `stage3Complete` = true
- Generates comprehensive report from all stage data

## Implementation Details

### Progress Tracker Component
```tsx
<div className="flex items-center gap-3 flex-1">
  {/* Stage 1 */}
  <div className={stage1Complete ? 'bg-emerald-100' : 'bg-slate-200'}>
    {stage1Complete ? <CheckCircle2 /> : <Circle />}
    <span>Stage 1</span>
  </div>
  
  {/* Connector */}
  <div className={stage1Complete ? 'bg-emerald-300' : 'bg-slate-300'} />
  
  {/* Stage 2 */}
  <div className={stage2Complete ? 'bg-emerald-100' : stage1Complete ? 'bg-cyan-100' : 'bg-slate-200'}>
    {stage2Complete ? <CheckCircle2 /> : stage1Complete ? <Circle /> : <Lock />}
    <span>Stage 2</span>
  </div>
  
  {/* ... similar for Stage 3 and Report */}
</div>
```

### Tab Navigation
```tsx
<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList>
    <TabsTrigger value="stage1">Business Intelligence</TabsTrigger>
    <TabsTrigger value="stage2" disabled={!stage1Complete}>Subreddit Discovery</TabsTrigger>
    <TabsTrigger value="stage3" disabled={!stage2Complete}>Thread Targeting</TabsTrigger>
    <TabsTrigger value="report" disabled={!stage3Complete}>Executive Report</TabsTrigger>
  </TabsList>
  
  <TabsContent value="stage1">{/* Stage 1 content */}</TabsContent>
  <TabsContent value="stage2">{/* Stage 2 content */}</TabsContent>
  <TabsContent value="stage3">{/* Stage 3 content */}</TabsContent>
  <TabsContent value="report">{/* Report content */}</TabsContent>
</Tabs>
```

### Auto-Progression Logic
```tsx
// In runScan function after Stage 1 completes
setStage1Complete(true);
setTimeout(() => setActiveTab('stage2'), 1500);

// After Stage 2 subreddit scan
setStage2Complete(true);
setTimeout(() => setActiveTab('stage3'), 1500);

// After first comment generation
setStage3Complete(true);
// User can manually navigate to Report tab
```

### Export Functionality (Stage 4)

#### PDF Export
```tsx
const exportPDF = () => {
  // Use jsPDF or similar library
  const doc = new jsPDF();
  
  // Add executive summary
  doc.text('Reddit GEO Agent - Executive Report', 20, 20);
  doc.text(`Niche: ${analysisData.nicheProfile.primaryNiche}`, 20, 40);
  doc.text(`Opportunity Score: ${analysisData.opportunityBaselineScore.overall}/100`, 20, 50);
  
  // Add metrics, recommendations, etc.
  doc.save('reddit-geo-report.pdf');
};
```

#### JSON Export
```tsx
const exportJSON = () => {
  const reportData = {
    timestamp: new Date().toISOString(),
    businessContext: {
      website: websiteUrl,
      region: targetRegion,
      goal: goalLabel[goal],
    },
    analysis: analysisData,
    scanContext: scanContext,
  };
  
  const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'reddit-geo-analysis.json';
  a.click();
};
```

## State Variables Added

```tsx
const [activeTab, setActiveTab] = useState('stage1');
const [stage1Complete, setStage1Complete] = useState(false);
const [stage2Complete, setStage2Complete] = useState(false);
const [stage3Complete, setStage3Complete] = useState(false);
```

## Imports Added

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, Download, FileText, Lock } from 'lucide-react';
```

## Benefits

1. **Clear Progression:** Users understand where they are in the workflow
2. **Reduced Cognitive Load:** Only show relevant content for current stage
3. **Better Knowledge Consumption:** Organized, focused presentation of intelligence
4. **Professional UX:** Matches enterprise SaaS tools (Ahrefs, SEMrush patterns)
5. **Actionable Outputs:** Export functionality for sharing and documentation
6. **Zero Functionality Loss:** All existing features preserved and enhanced

## Testing Checklist

- [ ] Stage 1: Business context form works, analysis displays correctly
- [ ] Stage 1 → Stage 2: Auto-navigation triggers after completion
- [ ] Stage 2: Tab unlocks, subreddit data displays
- [ ] Stage 2 → Stage 3: Auto-navigation triggers
- [ ] Stage 3: Thread table works, comment drawer opens
- [ ] Stage 3: Comment generation works with all variants
- [ ] Stage 4: Report tab unlocks after first comment
- [ ] Stage 4: PDF export generates correctly
- [ ] Stage 4: JSON export contains all data
- [ ] Progress tracker updates correctly at each stage
- [ ] Tab navigation guards prevent premature access
- [ ] Dev mode toggle works across all tabs
- [ ] All existing analytics/risk panels still function

## Next Steps

1. Complete the tabbed structure implementation
2. Build Executive Report tab with export functionality
3. Add enhanced filtering to Stage 2
4. Add loading skeletons for better perceived performance
5. Test complete workflow end-to-end
6. Deploy and gather user feedback
