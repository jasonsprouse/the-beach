import { Controller, Get, Post, Put, Body, Param, Query, Logger, UnauthorizedException } from '@nestjs/common';
import { PkpSalesService, CodePackage, MusicTrack } from './services/pkp-sales.service';
import { BiometricVerificationService } from '../biometric/biometric-verification.service';

@Controller('marketplace')
export class PkpSalesController {
  private readonly logger = new Logger(PkpSalesController.name);

  constructor(
    private readonly pkpSalesService: PkpSalesService,
    private readonly biometricService: BiometricVerificationService,
  ) {}

  // ==================== Code Packages ====================

  @Post('code-packages')
  async createCodePackage(@Body() packageData: any) {
    this.logger.log(`Creating code package: ${packageData.name}`);
    const pkg = await this.pkpSalesService.createCodePackage(packageData);
    
    return {
      success: true,
      package: pkg,
      packageCID: pkg.packageCID,
      salesPageURL: `https://marketplace.the-beach.app/package/${pkg.id}`,
      verificationLink: `https://marketplace.the-beach.app/verify/${pkg.packageCID}`,
    };
  }

  @Get('code-packages/:id')
  async getCodePackage(@Param('id') id: string) {
    const pkg = await this.pkpSalesService.getCodePackage(id);
    
    if (!pkg) {
      return { error: 'Package not found' };
    }
    
    return pkg;
  }

  @Get('code-packages')
  async listCodePackages(@Query('ownerPKP') ownerPKP?: string) {
    const packages = await this.pkpSalesService.listCodePackages(ownerPKP);
    
    return {
      count: packages.length,
      packages,
    };
  }

  @Put('code-packages/:id')
  async updateCodePackage(@Param('id') id: string, @Body() updates: any) {
    const updated = await this.pkpSalesService.updateCodePackage(id, updates);
    
    return {
      success: true,
      package: updated,
      newCID: updated.packageCID,
    };
  }

  // ==================== Music Tracks ====================

  @Post('music-tracks')
  async createMusicTrack(@Body() trackData: any) {
    this.logger.log(`Creating music track: ${trackData.title}`);
    const track = await this.pkpSalesService.createMusicTrack(trackData);
    
    return {
      success: true,
      track,
      trackCID: track.trackCID,
      salesPageURL: `https://marketplace.the-beach.app/track/${track.id}`,
      ipfsURL: `ipfs://${track.trackCID}`,
      soundcloudEmbed: track.soundcloudURL ? 
        `<iframe width="100%" height="166" scrolling="no" frameborder="no" src="${track.soundcloudURL}"></iframe>` : 
        null,
    };
  }

  @Get('music-tracks/:id')
  async getMusicTrack(@Param('id') id: string) {
    const track = await this.pkpSalesService.getMusicTrack(id);
    
    if (!track) {
      return { error: 'Track not found' };
    }
    
    return track;
  }

  @Get('music-tracks')
  async listMusicTracks(@Query('artistPKP') artistPKP?: string) {
    const tracks = await this.pkpSalesService.listMusicTracks(artistPKP);
    
    return {
      count: tracks.length,
      tracks,
    };
  }

  // ==================== Storefront ====================

  @Post('create-storefront')
  async createStorefront(@Body() data: any) {
    this.logger.log(`Creating storefront for PKP: ${data.ownerPKP}`);
    const storefront = await this.pkpSalesService.createStorefront(data);
    
    return {
      success: true,
      storefrontURL: `https://marketplace.the-beach.app/store/${storefront.ownerPKP}`,
      storefrontCID: storefront.storefrontCID,
      customDomain: storefront.customDomain,
      storefront,
    };
  }

  @Get('storefront/:pkp')
  async getStorefront(@Param('pkp') pkp: string) {
    const storefront = await this.pkpSalesService.getStorefront(pkp);
    
    if (!storefront) {
      return { error: 'Storefront not found' };
    }
    
    return storefront;
  }

  // ==================== Purchases ====================

  @Post('purchase')
  async createPurchase(@Body() purchaseData: any) {
    this.logger.log(`Processing purchase: ${purchaseData.itemType} ${purchaseData.itemId}`);
    
    // Add biometric verification for high-value purchases (>$100)
    if (purchaseData.price && purchaseData.price > 100) {
      this.logger.log(`🔐 Biometric verification required for $${purchaseData.price} purchase`);
      
      const biometric = await this.biometricService.verify({
        pkpAddress: purchaseData.buyerPKP,
        action: 'purchase',
        amount: purchaseData.price,
      });
      
      if (!biometric.verified) {
        this.logger.error(`❌ Biometric verification failed for purchase`);
        throw new UnauthorizedException('Biometric verification failed');
      }
      
      // Attach biometric token to purchase for audit trail
      purchaseData.biometricToken = biometric.token;
      purchaseData.assuranceLevel = biometric.assuranceLevel;
      
      this.logger.log(`✅ Biometric verified (${biometric.assuranceLevel}): ${biometric.deviceId}`);
    }
    
    const purchase = await this.pkpSalesService.createPurchase(purchaseData);
    
    return {
      success: true,
      purchase,
      purchaseCID: purchase.purchaseCID,
      licenseCID: purchase.licenseCID,
      downloadURL: `https://marketplace.the-beach.app/download/${purchase.licenseCID}`,
      verificationURL: `https://marketplace.the-beach.app/verify-license/${purchase.licenseCID}`,
      biometricVerified: !!purchaseData.biometricToken,
    };
  }

  @Get('purchase/:id')
  async getPurchase(@Param('id') id: string) {
    const purchase = await this.pkpSalesService.getPurchase(id);
    
    if (!purchase) {
      return { error: 'Purchase not found' };
    }
    
    return purchase;
  }

  @Get('purchases')
  async listPurchases(
    @Query('pkp') pkp: string,
    @Query('role') role: 'buyer' | 'seller' = 'buyer',
  ) {
    const purchases = await this.pkpSalesService.listPurchases(pkp, role);
    
    return {
      count: purchases.length,
      purchases,
    };
  }

  // ==================== Platform Linking ====================

  @Post('link-github')
  async linkGitHub(@Body() data: { pkp: string; repo: string }) {
    await this.pkpSalesService.linkGitHub(data.pkp, data.repo);
    
    return {
      success: true,
      platform: 'github',
      linked: data.repo,
    };
  }

  @Post('link-vercel')
  async linkVercel(@Body() data: { pkp: string; deployment: string }) {
    await this.pkpSalesService.linkVercel(data.pkp, data.deployment);
    
    return {
      success: true,
      platform: 'vercel',
      linked: data.deployment,
    };
  }

  @Post('link-soundcloud')
  async linkSoundCloud(@Body() data: { pkp: string; profile: string }) {
    await this.pkpSalesService.linkSoundCloud(data.pkp, data.profile);
    
    return {
      success: true,
      platform: 'soundcloud',
      linked: data.profile,
    };
  }

  @Post('link-gparadigm')
  async linkGParadigm(@Body() data: { pkp: string; orgId: string }) {
    await this.pkpSalesService.linkGParadigm(data.pkp, data.orgId);
    
    return {
      success: true,
      platform: 'gparadigm',
      linked: data.orgId,
    };
  }

  @Get('links/:pkp')
  async getPlatformLinks(@Param('pkp') pkp: string) {
    const links = await this.pkpSalesService.getPlatformLinks(pkp);
    
    return {
      pkp,
      platforms: links,
      linked: Object.keys(links),
    };
  }

  // ==================== Publishing ====================

  @Post('publish')
  async publish(@Body() data: {
    type: 'code_package' | 'music_track';
    packageId?: string;
    trackId?: string;
    publishTo: string[];
    pkpSignature: string;
  }) {
    this.logger.log(`Publishing ${data.type}: ${data.packageId || data.trackId}`);
    
    const itemId = data.packageId || data.trackId || '';
    const item = data.type === 'code_package' 
      ? await this.pkpSalesService.getCodePackage(itemId)
      : await this.pkpSalesService.getMusicTrack(itemId);
    
    if (!item) {
      return { error: 'Item not found' };
    }
    
    const published = {
      marketplace: data.publishTo.includes('marketplace'),
      github: data.publishTo.includes('github'),
      vercel: data.publishTo.includes('vercel') || data.publishTo.includes('vercel_showcase'),
      soundcloud: data.publishTo.includes('soundcloud'),
      gparadigm: data.publishTo.includes('gparadigm'),
      ipfs: data.publishTo.includes('ipfs'),
    };
    
    return {
      success: true,
      type: data.type,
      itemId,
      published,
      urls: {
        marketplace: published.marketplace ? `https://marketplace.the-beach.app/${data.type}/${itemId}` : null,
        github: published.github ? `https://github.com/jasonsprouse/the-beach` : null,
        vercel: published.vercel ? `https://the-beach.vercel.app` : null,
        soundcloud: published.soundcloud && 'soundcloudURL' in item ? item.soundcloudURL : null,
        ipfs: published.ipfs ? `ipfs://${data.type === 'music_track' ? (item as MusicTrack).trackCID : (item as CodePackage).packageCID}` : null,
      },
    };
  }

  // ==================== Analytics ====================

  @Get('analytics/:pkp')
  async getAnalytics(
    @Param('pkp') pkp: string,
    @Query('period') period: '7d' | '30d' | '90d' = '30d',
  ) {
    const analytics = await this.pkpSalesService.getAnalytics(pkp, period);
    
    return analytics;
  }

  // ==================== Verification ====================

  @Post('verify-purchase')
  async verifyPurchase(@Body() data: { packageCID: string; purchaseCID: string }) {
    const verification = await this.pkpSalesService.verifyPurchase(
      data.packageCID,
      data.purchaseCID,
    );
    
    return verification;
  }

  @Get('license/:licenseCID')
  async getLicenseInfo(@Param('licenseCID') licenseCID: string) {
    const license = await this.pkpSalesService.getLicenseInfo(licenseCID);
    
    return license;
  }

  // ==================== Helper Endpoints ====================

  @Get('dashboard/:pkp')
  async getDashboard(@Param('pkp') pkp: string) {
    const [
      codePackages,
      musicTracks,
      storefront,
      analytics,
      platformLinks,
    ] = await Promise.all([
      this.pkpSalesService.listCodePackages(pkp),
      this.pkpSalesService.listMusicTracks(pkp),
      this.pkpSalesService.getStorefront(pkp),
      this.pkpSalesService.getAnalytics(pkp, '30d'),
      this.pkpSalesService.getPlatformLinks(pkp),
    ]);
    
    return {
      pkp,
      storefront: storefront ? {
        url: `https://marketplace.the-beach.app/store/${pkp}`,
        customDomain: storefront.customDomain,
        cid: storefront.storefrontCID,
      } : null,
      inventory: {
        codePackages: codePackages.length,
        musicTracks: musicTracks.length,
      },
      analytics,
      platformLinks,
      quickActions: {
        createPackage: 'POST /marketplace/code-packages',
        createTrack: 'POST /marketplace/music-tracks',
        viewSales: `GET /marketplace/purchases?pkp=${pkp}&role=seller`,
      },
    };
  }

  @Get('status')
  async getStatus() {
    return {
      service: 'PKP Sales Marketplace',
      version: '1.0.0',
      features: [
        'Code package sales with PKP authentication',
        'Music track sales with SoundCloud integration',
        'IPLD tamper-proof verification',
        'Multi-platform distribution (GitHub, Vercel, SoundCloud, gparadigmOrg)',
        'Personal storefronts',
        'Revenue analytics',
        'License management',
      ],
      endpoints: {
        codePackages: '/marketplace/code-packages',
        musicTracks: '/marketplace/music-tracks',
        storefront: '/marketplace/create-storefront',
        purchases: '/marketplace/purchase',
        analytics: '/marketplace/analytics/:pkp',
        verification: '/marketplace/verify-purchase',
        publish: '/marketplace/publish',
      },
    };
  }
}
