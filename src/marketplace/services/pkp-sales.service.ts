import { Injectable, Logger } from '@nestjs/common';
import { IpldService } from '../../lit-compute/services/ipld.service';

export interface CodePackage {
  id: string;
  name: string;
  description: string;
  version: string;
  pricing: {
    type: 'fixed' | 'tiered';
    price?: number;
    tiers?: Array<{
      name: string;
      price: number;
      features: string[];
    }>;
  };
  repository: {
    type: 'github';
    url: string;
    branch: string;
    vercelDeployment?: string;
  };
  technologies: string[];
  features: string[];
  files: string[];
  ownerPKP: string;
  packageCID?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: {
    name: string;
    pkp: string;
    verified: boolean;
    googleAuth?: string;
  };
  soundcloudURL?: string;
  genre: string;
  duration: string;
  bpm?: number;
  key?: string;
  pricing: {
    stream: number;
    download: number;
    wavDownload: number;
    license: {
      personal: number;
      commercial: number;
      exclusive: number;
    };
  };
  metadata: {
    tags: string[];
    description: string;
    credits: string;
  };
  distribution: {
    soundcloud: boolean;
    gparadigmOrg: boolean;
    ipfs: boolean;
  };
  trackCID?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Storefront {
  ownerPKP: string;
  storeName: string;
  description: string;
  branding: {
    logo?: string;
    primaryColor: string;
    accentColor: string;
  };
  sections: Array<{
    type: 'code_packages' | 'music_catalog';
    title: string;
    featured: string[];
  }>;
  socials: {
    github?: string;
    soundcloud?: string;
    vercel?: string;
    gparadigm?: string;
  };
  storefrontCID?: string;
  customDomain?: string;
  createdAt: Date;
}

export interface Purchase {
  purchaseId: string;
  buyer: string;
  seller: string;
  itemType: 'code_package' | 'music_track' | 'bundle';
  itemId: string;
  price: number;
  licenseType?: string;
  purchaseCID?: string;
  licenseCID?: string;
  createdAt: Date;
  status: 'pending' | 'completed' | 'refunded';
}

@Injectable()
export class PkpSalesService {
  private readonly logger = new Logger(PkpSalesService.name);
  
  private codePackages: Map<string, CodePackage> = new Map();
  private musicTracks: Map<string, MusicTrack> = new Map();
  private storefronts: Map<string, Storefront> = new Map();
  private purchases: Map<string, Purchase> = new Map();
  private platformLinks: Map<string, any> = new Map();

  constructor(private readonly ipldService: IpldService) {
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample code packages
    const samplePackages: CodePackage[] = [
      {
        id: 'babylon-xr-vr-scene',
        name: 'Babylon.js VR Scene Template',
        description: 'Ready-to-use VR scene with hand tracking, teleportation, object interaction',
        version: '1.0.0',
        pricing: {
          type: 'fixed',
          price: 29.99,
        },
        repository: {
          type: 'github',
          url: 'https://github.com/jasonsprouse/the-beach',
          branch: 'main',
        },
        technologies: ['Babylon.js', 'WebXR', 'TypeScript'],
        features: ['Hand tracking', 'Teleportation', 'Object interaction', 'VR controllers'],
        files: ['src/vr/**/*', 'docs/VR_SETUP.md'],
        ownerPKP: 'sample-pkp-key',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'pkp-auth-system',
        name: 'PKP Authentication System',
        description: 'Complete Lit Protocol PKP auth with Google/social login, sub-PKP delegation',
        version: '1.0.0',
        pricing: {
          type: 'fixed',
          price: 99.99,
        },
        repository: {
          type: 'github',
          url: 'https://github.com/jasonsprouse/the-beach',
          branch: 'main',
        },
        technologies: ['Lit Protocol', 'NestJS', 'TypeScript', 'OAuth'],
        features: ['Google login', 'Sub-PKP delegation', 'Approval workflows', 'WebAuthn support'],
        files: ['src/npe/services/pkp-auth.service.ts', 'src/npe/pkp-auth.controller.ts'],
        ownerPKP: 'sample-pkp-key',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'complete-platform',
        name: 'Complete Beach XR Platform',
        description: 'Full codebase with all systems, lifetime updates, custom support',
        version: '1.0.0',
        pricing: {
          type: 'tiered',
          tiers: [
            {
              name: 'Developer License',
              price: 1999.99,
              features: ['Full source code', 'Documentation', 'Lifetime updates', 'Email support'],
            },
            {
              name: 'Enterprise License',
              price: 4999.99,
              features: ['Full source code', 'White-label rights', 'Priority support', 'Custom development', 'Revenue sharing'],
            },
          ],
        },
        repository: {
          type: 'github',
          url: 'https://github.com/jasonsprouse/the-beach',
          branch: 'main',
          vercelDeployment: 'https://vercel.com/jasonsprouses-projects/the-beach',
        },
        technologies: ['NestJS', 'Babylon.js', 'Lit Protocol', 'IPLD', 'Redis', 'PostgreSQL'],
        features: ['VR Marketplace', 'PKP Auth', 'AI Agents', 'IPLD storage', 'Log monetization'],
        files: ['**/*'],
        ownerPKP: 'sample-pkp-key',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    samplePackages.forEach(pkg => {
      this.codePackages.set(pkg.id, pkg);
    });

    this.logger.log(`Initialized ${samplePackages.length} sample code packages`);
  }

  // ==================== Code Package Management ====================

  async createCodePackage(packageData: Partial<CodePackage>): Promise<CodePackage> {
    const pkg: CodePackage = {
      id: packageData.id || `pkg-${Date.now()}`,
      name: packageData.name || 'Unnamed Package',
      description: packageData.description || '',
      version: packageData.version || '1.0.0',
      pricing: packageData.pricing || { type: 'fixed', price: 0 },
      repository: packageData.repository || { type: 'github', url: '', branch: 'main' },
      technologies: packageData.technologies || [],
      features: packageData.features || [],
      files: packageData.files || [],
      ownerPKP: packageData.ownerPKP || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Create IPLD CID for package using createNodeCID
    const packageCID = await this.ipldService.createNodeCID({
      walletAddress: pkg.ownerPKP,
      publicKey: pkg.ownerPKP,
      capabilities: { type: 'code_package', ...pkg },
      timestamp: Date.now(),
    });
    pkg.packageCID = packageCID;

    this.codePackages.set(pkg.id, pkg);
    this.logger.log(`Created code package: ${pkg.name} (CID: ${packageCID})`);

    return pkg;
  }

  async getCodePackage(packageId: string): Promise<CodePackage | undefined> {
    return this.codePackages.get(packageId);
  }

  async listCodePackages(ownerPKP?: string): Promise<CodePackage[]> {
    const packages = Array.from(this.codePackages.values());
    if (ownerPKP) {
      return packages.filter(pkg => pkg.ownerPKP === ownerPKP);
    }
    return packages;
  }

  async updateCodePackage(packageId: string, updates: Partial<CodePackage>): Promise<CodePackage> {
    const pkg = this.codePackages.get(packageId);
    if (!pkg) {
      throw new Error(`Package not found: ${packageId}`);
    }

    const updated = { ...pkg, ...updates, updatedAt: new Date() };
    
    // Update IPLD CID using createNodeCID
    const newCID = await this.ipldService.createNodeCID({
      walletAddress: updated.ownerPKP,
      publicKey: updated.ownerPKP,
      capabilities: { type: 'code_package', ...updated },
      timestamp: Date.now(),
    });
    updated.packageCID = newCID;

    this.codePackages.set(packageId, updated);
    this.logger.log(`Updated code package: ${packageId} (new CID: ${newCID})`);

    return updated;
  }

  // ==================== Music Track Management ====================

  async createMusicTrack(trackData: Partial<MusicTrack>): Promise<MusicTrack> {
    const track: MusicTrack = {
      id: trackData.id || `track-${Date.now()}`,
      title: trackData.title || 'Untitled Track',
      artist: trackData.artist || { name: 'Unknown', pkp: '', verified: false },
      soundcloudURL: trackData.soundcloudURL,
      genre: trackData.genre || 'Unknown',
      duration: trackData.duration || '0:00',
      bpm: trackData.bpm,
      key: trackData.key,
      pricing: trackData.pricing || {
        stream: 0.01,
        download: 1.99,
        wavDownload: 4.99,
        license: { personal: 9.99, commercial: 49.99, exclusive: 499.99 },
      },
      metadata: trackData.metadata || { tags: [], description: '', credits: '' },
      distribution: trackData.distribution || { soundcloud: false, gparadigmOrg: false, ipfs: false },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Create IPLD CID for track using createNodeCID
    const trackCID = await this.ipldService.createNodeCID({
      walletAddress: track.artist.pkp,
      publicKey: track.artist.pkp,
      capabilities: { type: 'music_track', ...track },
      timestamp: Date.now(),
    });
    track.trackCID = trackCID;

    this.musicTracks.set(track.id, track);
    this.logger.log(`Created music track: ${track.title} (CID: ${trackCID})`);

    return track;
  }

  async getMusicTrack(trackId: string): Promise<MusicTrack | undefined> {
    return this.musicTracks.get(trackId);
  }

  async listMusicTracks(artistPKP?: string): Promise<MusicTrack[]> {
    const tracks = Array.from(this.musicTracks.values());
    if (artistPKP) {
      return tracks.filter(track => track.artist.pkp === artistPKP);
    }
    return tracks;
  }

  // ==================== Storefront Management ====================

  async createStorefront(data: Partial<Storefront>): Promise<Storefront> {
    const storefront: Storefront = {
      ownerPKP: data.ownerPKP || '',
      storeName: data.storeName || 'My Store',
      description: data.description || '',
      branding: data.branding || { primaryColor: '#00D4FF', accentColor: '#FF00FF' },
      sections: data.sections || [],
      socials: data.socials || {},
      createdAt: new Date(),
    };

    // Create IPLD CID for storefront using createNodeCID
    const storefrontCID = await this.ipldService.createNodeCID({
      walletAddress: storefront.ownerPKP,
      publicKey: storefront.ownerPKP,
      capabilities: { type: 'storefront', ...storefront },
      timestamp: Date.now(),
    });
    storefront.storefrontCID = storefrontCID;
    storefront.customDomain = `${storefront.ownerPKP.substring(0, 8)}.the-beach.app`;

    this.storefronts.set(storefront.ownerPKP, storefront);
    this.logger.log(`Created storefront for PKP: ${storefront.ownerPKP}`);

    return storefront;
  }

  async getStorefront(pkp: string): Promise<Storefront | undefined> {
    return this.storefronts.get(pkp);
  }

  // ==================== Purchase Management ====================

  async createPurchase(purchaseData: {
    buyer: string;
    seller: string;
    itemType: 'code_package' | 'music_track' | 'bundle';
    itemId: string;
    price: number;
    licenseType?: string;
  }): Promise<Purchase> {
    const purchase: Purchase = {
      purchaseId: `purchase-${Date.now()}`,
      buyer: purchaseData.buyer,
      seller: purchaseData.seller,
      itemType: purchaseData.itemType,
      itemId: purchaseData.itemId,
      price: purchaseData.price,
      licenseType: purchaseData.licenseType,
      createdAt: new Date(),
      status: 'pending',
    };

    // Create IPLD CID for purchase using createJobCID
    const purchaseCID = await this.ipldService.createJobCID({
      type: 'purchase',
      input: purchase,
      requirements: { type: 'marketplace_transaction' },
      timestamp: Date.now(),
    });
    purchase.purchaseCID = purchaseCID;

    // Create license CID linking to purchase
    const licenseCID = await this.ipldService.createJobCID({
      type: 'license',
      input: {
        purchaseCID,
        buyer: purchase.buyer,
        itemId: purchase.itemId,
        licenseType: purchase.licenseType,
        issuedAt: new Date().toISOString(),
      },
      requirements: { type: 'license_grant' },
      timestamp: Date.now(),
    });
    purchase.licenseCID = licenseCID;
    purchase.status = 'completed';

    this.purchases.set(purchase.purchaseId, purchase);
    this.logger.log(`Created purchase: ${purchase.purchaseId} (License CID: ${licenseCID})`);

    return purchase;
  }

  async getPurchase(purchaseId: string): Promise<Purchase | undefined> {
    return this.purchases.get(purchaseId);
  }

  async listPurchases(pkp: string, role: 'buyer' | 'seller'): Promise<Purchase[]> {
    const purchases = Array.from(this.purchases.values());
    return purchases.filter(p => role === 'buyer' ? p.buyer === pkp : p.seller === pkp);
  }

  // ==================== Platform Linking ====================

  async linkGitHub(pkp: string, repo: string): Promise<void> {
    const links = this.platformLinks.get(pkp) || {};
    links.github = repo;
    this.platformLinks.set(pkp, links);
    this.logger.log(`Linked GitHub repo for PKP ${pkp}: ${repo}`);
  }

  async linkVercel(pkp: string, deployment: string): Promise<void> {
    const links = this.platformLinks.get(pkp) || {};
    links.vercel = deployment;
    this.platformLinks.set(pkp, links);
    this.logger.log(`Linked Vercel deployment for PKP ${pkp}: ${deployment}`);
  }

  async linkSoundCloud(pkp: string, profile: string): Promise<void> {
    const links = this.platformLinks.get(pkp) || {};
    links.soundcloud = profile;
    this.platformLinks.set(pkp, links);
    this.logger.log(`Linked SoundCloud profile for PKP ${pkp}: ${profile}`);
  }

  async linkGParadigm(pkp: string, orgId: string): Promise<void> {
    const links = this.platformLinks.get(pkp) || {};
    links.gparadigm = orgId;
    this.platformLinks.set(pkp, links);
    this.logger.log(`Linked Google Paradigm Org for PKP ${pkp}: ${orgId}`);
  }

  async getPlatformLinks(pkp: string): Promise<any> {
    return this.platformLinks.get(pkp) || {};
  }

  // ==================== Analytics ====================

  async getAnalytics(pkp: string, period: '7d' | '30d' | '90d' = '30d'): Promise<any> {
    const purchases = await this.listPurchases(pkp, 'seller');
    const codePackages = await this.listCodePackages(pkp);
    const musicTracks = await this.listMusicTracks(pkp);

    const codeSales = purchases.filter(p => p.itemType === 'code_package');
    const musicSales = purchases.filter(p => p.itemType === 'music_track');

    const totalCodeRevenue = codeSales.reduce((sum, p) => sum + p.price, 0);
    const totalMusicRevenue = musicSales.reduce((sum, p) => sum + p.price, 0);

    return {
      period: `last_${period}`,
      codeSales: {
        totalRevenue: totalCodeRevenue,
        transactions: codeSales.length,
        packages: codePackages.length,
        topPackage: codePackages[0]?.name || 'N/A',
      },
      musicSales: {
        totalRevenue: totalMusicRevenue,
        transactions: musicSales.length,
        tracks: musicTracks.length,
        topTrack: musicTracks[0]?.title || 'N/A',
      },
      totalRevenue: totalCodeRevenue + totalMusicRevenue,
      totalTransactions: purchases.length,
      projections: {
        nextMonth: (totalCodeRevenue + totalMusicRevenue) * 1.2, // 20% growth estimate
        nextQuarter: (totalCodeRevenue + totalMusicRevenue) * 3.5,
        annual: (totalCodeRevenue + totalMusicRevenue) * 12 * 1.15,
      },
    };
  }

  // ==================== Verification ====================

  async verifyPurchase(packageCID: string, purchaseCID: string): Promise<any> {
    // Verify both CIDs exist in IPLD using resolve
    const packageData = await this.ipldService.resolve(packageCID);
    const purchaseData = await this.ipldService.resolve(purchaseCID);

    if (!packageData || !purchaseData) {
      return { verified: false, error: 'CID not found' };
    }

    return {
      verified: true,
      package: packageData,
      purchase: purchaseData,
      integrityCheck: 'PASS',
      ipldChain: [packageCID, purchaseCID],
    };
  }

  async getLicenseInfo(licenseCID: string): Promise<any> {
    const licenseData = await this.ipldService.resolve(licenseCID);
    
    if (!licenseData) {
      return { error: 'License not found' };
    }

    return {
      licenseCID,
      ...licenseData,
      verified: true,
      ipfsURL: `ipfs://${licenseCID}`,
    };
  }
}
