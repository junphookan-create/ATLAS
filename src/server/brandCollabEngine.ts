import {
  BrandDossier,
  SponsorshipPackage,
  MediaKitData,
  BrandDeal,
  BrandDealDeliverable,
  BrandDealInvoice,
  SocialPost,
} from '../types';

export class BrandCollabEngine {
  /**
   * Returns standard tiered sponsorship packages for creators and technical researchers.
   */
  public static getStandardSponsorshipPackages(): SponsorshipPackage[] {
    return [
      {
        id: 'pkg-bronze',
        tierName: 'Bronze',
        priceUsd: 3500,
        deliverablesSummary: ['1x Dedicated X/Twitter Thread', '1x Newsletter Shoutout', 'Brand Logo on GitHub Readme'],
        estimatedReach: 45000,
        projectedImpressions: 65000,
        includedChannels: ['X/Twitter', 'Substack / Newsletter', 'GitHub'],
        exclusiveSponsorshipDays: 7,
        features: [
          'Permanent link in bio for 7 days',
          'UTM Link Tracking & Click Analytics',
          'Targeted reach to 14k+ verified AI & hardware engineers',
        ],
      },
      {
        id: 'pkg-silver',
        tierName: 'Silver',
        priceUsd: 8500,
        deliverablesSummary: ['1x In-Depth LinkedIn Article', '1x 5-Slide Instagram Educational Carousel', '2x Dedicated X/Twitter Threads'],
        estimatedReach: 120000,
        projectedImpressions: 180000,
        includedChannels: ['LinkedIn', 'Instagram', 'X/Twitter'],
        exclusiveSponsorshipDays: 14,
        features: [
          'Deep technical product integration or benchmarking case study',
          'Full-resolution media assets provided for brand repurposing',
          'Guaranteed minimum 100k impressions with post-campaign sentiment analysis',
          'A/B tested copywriting hooks to maximize developer click-through',
        ],
      },
      {
        id: 'pkg-gold',
        tierName: 'Gold',
        priceUsd: 25000,
        deliverablesSummary: [
          '1x Dedicated 60s Vertical Video (TikTok / Shorts / Reels)',
          '1x 10-Minute YouTube Technical Deep Dive',
          '2x In-Depth LinkedIn Thought Leadership Articles',
          '3x High-Velocity X/Twitter Threads',
          'Exclusive Category Sponsorship for 30 Days',
        ],
        estimatedReach: 350000,
        projectedImpressions: 550000,
        includedChannels: ['YouTube', 'TikTok', 'LinkedIn', 'Instagram', 'X/Twitter', 'Newsletter'],
        exclusiveSponsorshipDays: 30,
        features: [
          'Top-tier flagship campaign integration',
          'Interactive Colab notebook or live benchmarking benchmark using brand hardware/API',
          'Executive quote inclusion and direct talent recruitment CTA',
          'Comprehensive Post-Campaign ROI & Conversion Attribution Report',
        ],
      },
    ];
  }

  /**
   * Generates the dynamic creator Media Kit containing audited demographics, engagement rates,
   * case studies, and standard rate cards.
   */
  public static getCreatorMediaKit(): MediaKitData {
    return {
      creatorName: 'Jun Phookan',
      niche: 'Applied AI, Neuromorphic Hardware, & Edge Computing',
      tagline: 'Empowering 14,000+ AI researchers and developers with cutting-edge open-source engineering.',
      totalNetworkReach: 14820,
      avgEngagementRate: 5.2,
      demographics: {
        occupations: [
          { label: 'AI / ML Engineers', percentage: 44 },
          { label: 'Academic Researchers & Lab Directors', percentage: 26 },
          { label: 'Tech Founders & CTOs', percentage: 18 },
          { label: 'STEM Students & Competitors', percentage: 12 },
        ],
        ageGroups: [
          { label: '22 - 34 Years (Core Tech Workforce)', percentage: 68 },
          { label: '35 - 44 Years (Senior / Directors)', percentage: 22 },
          { label: '18 - 21 Years (Emerging Talent)', percentage: 10 },
        ],
        topLocations: [
          { label: 'United States (Silicon Valley, Boston, NYC)', percentage: 48 },
          { label: 'European Union (UK, Germany, Switzerland)', percentage: 28 },
          { label: 'Asia-Pacific (Singapore, Japan, India)', percentage: 24 },
        ],
      },
      topContentCaseStudies: [
        {
          title: 'NVIDIA Jetson Orin Benchmark Case Study',
          platform: 'LinkedIn & X/Twitter',
          impressions: 82400,
          engagement: '6.4% Engagement (520+ shares)',
          keyTakeaway: 'Drove 2,800+ clicks directly to developer documentation and 450+ GitHub repo stars within 48 hours.',
        },
        {
          title: 'FPGA Neuromorphic Accelerator Deep Dive',
          platform: 'Instagram Carousel & YouTube',
          impressions: 46200,
          engagement: '8.1% Engagement (1,100 saves)',
          keyTakeaway: 'High educational value generated 94% positive brand sentiment for developer tooling hardware.',
        },
      ],
      pastBrandCollaborators: ['NVIDIA Developer', 'Weights & Biases', 'Raspberry Pi Foundation', 'Hugging Face'],
      standardPricingTiers: this.getStandardSponsorshipPackages(),
      contactEmail: 'partnerships@junphookan.ai',
    };
  }

  /**
   * Discovers prospective brand collaboration opportunities across platforms
   * (AspireIQ, Upfluence, Competitor Scraping, Website Partnership Portals).
   */
  public static discoverProspectiveBrands(): BrandDossier[] {
    return [
      {
        id: 'brand-01',
        brandName: 'NVIDIA Embedded & Robotics Lab',
        website: 'https://developer.nvidia.com/embedded-computing',
        industry: 'Edge AI Silicon & Robotics',
        missionStatement: 'Accelerating autonomous machines and edge AI with compact, energy-efficient Jetson hardware.',
        targetDemographics: 'Embedded AI engineers, roboticists, computational neuroscience researchers, and hardware hackers.',
        recentCampaigns: ['#JetsonCommunityContest', 'Edge AI Developer Spotlight', 'Sparse Inference Benchmark Drive'],
        productPortfolio: ['Jetson Orin Nano Developer Kit', 'Jetson AGX Orin 64GB', 'NVIDIA Isaac ROS 2 Framework'],
        financialTier: 'Enterprise / Tech Giant',
        fitScore: 98,
        fitRationale: 'Exceptional 98% brand alignment. User actively writes open-source code for Jetson architectures, and 44% of audience are ML/embedded engineers who purchase developer kits.',
        primaryContact: {
          name: 'Sarah Lin',
          role: 'Global Developer Relations Lead',
          email: 'slin@nvidia.com',
          linkedinUrl: 'https://linkedin.com/in/sarahlin-nvidia',
          location: 'Santa Clara, CA, USA',
        },
        discoverySource: 'Competitor_Scrape',
        matchedCompetitorCampaign: 'Sponsored Stanford Robotics lab benchmarking video on YouTube ($12k deal)',
        pitchStatus: 'in_negotiation',
        lastInteractedDate: '2026-08-11',
      },
      {
        id: 'brand-02',
        brandName: 'Weights & Biases (W&B)',
        website: 'https://wandb.ai',
        industry: 'MLOps & Experiment Tracking',
        missionStatement: 'The AI developer platform built for tracking models, datasets, and collaborative evaluation.',
        targetDemographics: 'Machine learning engineers, PhD researchers, and data science teams.',
        recentCampaigns: ['LLM Evaluation Benchmark', 'Reproducible Research Month', 'Academic Grant Sponsorship'],
        productPortfolio: ['W&B Models', 'W&B Weave', 'W&B Core Experiment Tracker'],
        financialTier: 'Series B-D Scaleup',
        fitScore: 94,
        fitRationale: 'High alignment (94%). Perfect opportunity to sponsor a live benchmarking dashboard tracking neuromorphic vs dense attention experiments in W&B Weave.',
        primaryContact: {
          name: 'David Chen',
          role: 'Head of Academic & Creator Partnerships',
          email: 'dchen@wandb.com',
          linkedinUrl: 'https://linkedin.com/in/davidchen-wandb',
          location: 'San Francisco, CA, USA',
        },
        discoverySource: 'AspireIQ',
        pitchStatus: 'pitch_drafted',
        lastInteractedDate: '2026-08-12',
      },
      {
        id: 'brand-03',
        brandName: 'Seeed Studio (Open Hardware)',
        website: 'https://seeedstudio.com',
        industry: 'Edge Computing & Open Source Hardware',
        missionStatement: 'Enabling hardware innovators with IoT sensors, edge controllers, and custom manufacturing.',
        targetDemographics: 'Makers, STEM educators, university labs, and IoT product developers.',
        recentCampaigns: ['reComputer Jetson Series', 'SenseCAP Climate AI Challenge', 'Open Hardware Innovator Grant'],
        productPortfolio: ['reComputer J4012 Carrier', 'Grove Sensor Ecosystem', 'EdgeBox RPi Controller'],
        financialTier: 'Series B-D Scaleup',
        fitScore: 89,
        fitRationale: 'Strong alignment (89%) for hardware unboxing, modular testing, and science competition sponsorships.',
        primaryContact: {
          name: 'Lilian Zhao',
          role: 'Brand Collaboration Manager',
          email: 'lilian.zhao@seeed.cc',
          location: 'Shenzhen / Global',
        },
        discoverySource: 'Website_Crawler',
        pitchStatus: 'prospective',
      },
      {
        id: 'brand-04',
        brandName: 'Anyscale (Ray Framework)',
        website: 'https://anyscale.com',
        industry: 'Distributed AI Compute',
        missionStatement: 'Scaling AI and Python applications seamlessly from laptop to cloud cluster.',
        targetDemographics: 'Enterprise AI architects, distributed systems researchers, and ML engineers.',
        recentCampaigns: ['Ray Summit 2026', 'Distributed Hyperparameter Tuning Sprint'],
        productPortfolio: ['Anyscale Endpoints', 'Ray Core', 'Ray Train & Serve'],
        financialTier: 'Series B-D Scaleup',
        fitScore: 86,
        fitRationale: 'Strong 86% fit for multi-node sparse training benchmarks and tutorials.',
        primaryContact: {
          name: 'Alex Turner',
          role: 'Developer Marketing Director',
          email: 'alex.turner@anyscale.com',
          location: 'San Francisco, CA, USA',
        },
        discoverySource: 'Upfluence',
        pitchStatus: 'prospective',
      },
    ];
  }

  /**
   * Generates a high-converting, commercial pitch email personalized for a prospective brand.
   */
  public static generateCommercialPitch(brand: BrandDossier, packageTier: 'Bronze' | 'Silver' | 'Gold' = 'Silver'): {
    subject: string;
    body: string;
    suggestedPackage: SponsorshipPackage;
  } {
    const packages = this.getStandardSponsorshipPackages();
    const pkg = packages.find((p) => p.tierName === packageTier) || packages[1];

    const subject = `Partnership Proposal: Engaging 14k+ AI & Embedded Engineers with ${brand.brandName}`;
    const body = `Hi ${brand.primaryContact.name.split(' ')[0]},\n\nI have been closely tracking ${brand.brandName}'s recent push around ${brand.recentCampaigns[0] || 'developer ecosystem enablement'}. As an AI researcher developing open-source neuromorphic architectures, our team regularly benchmarks on ${brand.productPortfolio[0] || 'edge AI hardware'}.\n\nOur technical research channel reaches a highly concentrated demographic of 14,800+ engineers (44% ML engineers, 26% academic lab researchers) with an average engagement rate of 5.2%—over 2.5x the industry standard.\n\nWe would love to partner with ${brand.brandName} on our upcoming technical release for our ${pkg.tierName} Sponsorship Package ($${pkg.priceUsd.toLocaleString()} USD):\n\nKey Deliverables:\n${pkg.deliverablesSummary.map((d) => `• ${d}`).join('\n')}\n\nProjected Campaign Impact:\n• ~${pkg.projectedImpressions.toLocaleString()} targeted developer impressions\n• Full technical reproducibility with interactive Colab & GitHub repo\n• Comprehensive post-campaign sentiment & conversion reporting\n\nI have attached our complete Media Kit with audience demographics and verified case studies. Would you or someone on your developer marketing team have 10 minutes next Tuesday or Wednesday to explore this collaboration?\n\nBest regards,\nJun Phookan\nApplied AI & Neuromorphic Computing Researcher\npartnerships@junphookan.ai`;

    return {
      subject,
      body,
      suggestedPackage: pkg,
    };
  }

  /**
   * Returns active and past brand deals with deliverables, invoices, and post-campaign ROI analytics.
   */
  public static getActiveBrandDeals(): BrandDeal[] {
    return [
      {
        id: 'deal-nvidia-2026',
        brandId: 'brand-01',
        brandName: 'NVIDIA Embedded & Robotics Lab',
        dealTitle: 'Q3 Edge Neuromorphic Benchmarking & Jetson Orin Showcase',
        packageTier: 'Platinum',
        contractValueUsd: 25000,
        status: 'deliverables_active',
        contactPerson: 'Sarah Lin (Global DevRel Lead)',
        contactEmail: 'slin@nvidia.com',
        contractSignDate: '2026-08-01',
        campaignStartDate: '2026-08-10',
        campaignEndDate: '2026-08-30',
        deliverables: [
          {
            id: 'del-01',
            dealId: 'deal-nvidia-2026',
            title: 'Technical LinkedIn Long-Form Article on Jetson Orin STDP Latency',
            platform: 'LinkedIn',
            format: 'article_shoutout',
            dueDate: '2026-08-16',
            status: 'scheduled',
            linkedPostId: 'post-li-active',
            utmTrackingUrl: 'https://developer.nvidia.com/embedded-computing?utm_source=junphookan&utm_medium=linkedin&utm_campaign=q3_neuromorphic',
            metrics: {
              impressions: 48000,
              clicks: 1420,
              conversions: 210,
              earnedMediaValueUsd: 8400,
            },
          },
          {
            id: 'del-02',
            dealId: 'deal-nvidia-2026',
            title: '5-Slide Instagram Educational Hardware Architecture Carousel',
            platform: 'Instagram',
            format: 'carousel',
            dueDate: '2026-08-17',
            status: 'scheduled',
            linkedPostId: 'post-ig-active',
            utmTrackingUrl: 'https://developer.nvidia.com/embedded-computing?utm_source=junphookan&utm_medium=instagram&utm_campaign=q3_neuromorphic',
            metrics: {
              impressions: 34000,
              clicks: 890,
              conversions: 140,
              earnedMediaValueUsd: 5600,
            },
          },
          {
            id: 'del-03',
            dealId: 'deal-nvidia-2026',
            title: '60s Vertical Video Explaining Jetson Sparse Accelerator',
            platform: 'TikTok',
            format: 'dedicated_video',
            dueDate: '2026-08-20',
            status: 'drafting',
            utmTrackingUrl: 'https://developer.nvidia.com/embedded-computing?utm_source=junphookan&utm_medium=tiktok&utm_campaign=q3_neuromorphic',
          },
        ],
        invoices: [
          {
            invoiceNumber: 'INV-2026-NVD-01',
            dealId: 'deal-nvidia-2026',
            amountUsd: 12500,
            paymentTerms: '50% Upfront, 50% on Completion',
            issuedDate: '2026-08-02',
            dueDate: '2026-08-17',
            status: 'paid',
            paymentLinkOrWireInfo: 'Wire Transfer / ACH received (Ref: #NV-881923)',
          },
          {
            invoiceNumber: 'INV-2026-NVD-02',
            dealId: 'deal-nvidia-2026',
            amountUsd: 12500,
            paymentTerms: '50% Upfront, 50% on Completion',
            issuedDate: '2026-08-22',
            dueDate: '2026-09-06',
            status: 'draft',
            paymentLinkOrWireInfo: 'Pending completion of final video deliverable',
          },
        ],
        communicationLog: [
          {
            id: 'com-1',
            date: '2026-08-01',
            sender: 'brand',
            summary: 'Countersigned Platinum Partnership Agreement ($25k). Transferred 50% deposit.',
            attachmentName: 'NVIDIA_JunPhookan_Sponsorship_Executed.pdf',
          },
          {
            id: 'com-2',
            date: '2026-08-08',
            sender: 'user',
            summary: 'Submitted LinkedIn draft copy and Instagram carousel proofs for brand review.',
          },
          {
            id: 'com-3',
            date: '2026-08-10',
            sender: 'brand',
            summary: 'Brand review approved with minor UTM tag tweak for Jetson developer portal.',
          },
        ],
        postCampaignReport: {
          totalImpressions: 142000,
          totalEngagements: 8940,
          totalClicks: 3410,
          estimatedRoiRatio: 3.8, // 3.8x Earned Media Value vs Contract Value
          creatorHourlyEarnedRate: 520, // $520/hour of production time
          sentimentBreakdown: {
            positive: 92.4,
            neutral: 6.8,
            negative: 0.8,
          },
          topCommentQuotes: [
            '"Best demonstration of Jetson Orin INT8 compute scaling I have seen all year."',
            '"Just ordered two Jetson kits for our robotics lab because of this benchmark."',
          ],
          clientRenewalLikelihood: 'High',
        },
      },
      {
        id: 'deal-wb-2026',
        brandId: 'brand-02',
        brandName: 'Weights & Biases',
        dealTitle: 'Interactive Experiment Dashboard & Reproducibility Sponsorship',
        packageTier: 'Silver',
        contractValueUsd: 8500,
        status: 'in_negotiation',
        contactPerson: 'David Chen',
        contactEmail: 'dchen@wandb.com',
        campaignStartDate: '2026-09-01',
        campaignEndDate: '2026-09-15',
        deliverables: [
          {
            id: 'del-wb-1',
            dealId: 'deal-wb-2026',
            title: 'W&B Weave Evaluation Integration in Open-Source Repo',
            platform: 'LinkedIn',
            format: 'article_shoutout',
            dueDate: '2026-09-05',
            status: 'drafting',
          },
        ],
        invoices: [],
        communicationLog: [
          {
            id: 'com-wb-1',
            date: '2026-08-12',
            sender: 'user',
            summary: 'Sent custom Silver proposal with W&B Weave benchmark demo.',
          },
        ],
      },
    ];
  }

  /**
   * Automatically synchronizes brand deal deliverables into scheduled SocialPosts
   * in the Social Media Manager calendar.
   */
  public static syncDeliverablesToSocialPosts(deal: BrandDeal): SocialPost[] {
    return deal.deliverables.map((del) => ({
      id: `post-deal-${del.id}`,
      platform: del.platform,
      caption: `🚀 Proud to partner with ${deal.brandName} to accelerate open-source research!\n\nHere is our comprehensive benchmark analysis on high-efficiency computing.\n\nExplore the full interactive documentation and developer portal below:\n🔗 ${del.utmTrackingUrl || deal.brandName}\n\n#Sponsored #${deal.brandName.replace(/\s+/g, '')} #AIHardware #MachineLearning`,
      mediaType: del.format === 'carousel' ? 'carousel' : del.format === 'dedicated_video' ? 'video' : 'image',
      scheduledTime: `${del.dueDate} 14:00 UTC`,
      status: 'pending_approval',
      hashtags: ['Sponsored', deal.brandName.replace(/\s+/g, ''), 'AIHardware', 'MachineLearning'],
      dealId: deal.id,
      campaignTag: deal.dealTitle,
      altText: `Sponsored technical showcase and benchmark analysis in partnership with ${deal.brandName}.`,
      complianceChecked: true,
      complianceIssues: [],
    }));
  }
}
