import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

// Deploying as a standard Node.js Serverless Function (50MB limit) 
// instead of Edge (1MB limit) to easily accommodate the 1.2MB of custom .ttf fonts.

// Native Node fs paths must point to the guaranteed universally deployed `public` folder inside Vercel
const fraunces600P = readFile(join(process.cwd(), 'public', 'og-fonts', 'Fraunces-SemiBold.ttf'));
const dmSans400P = readFile(join(process.cwd(), 'public', 'og-fonts', 'DMSans-Regular.ttf'));
const dmSans500P = readFile(join(process.cwd(), 'public', 'og-fonts', 'DMSans-Medium.ttf'));
const dmSans600P = readFile(join(process.cwd(), 'public', 'og-fonts', 'DMSans-SemiBold.ttf'));

async function handleGET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Core parameters
    const template = searchParams.get('template') || 'default';
    const title = searchParams.get('title') || 'Talk to your visitors.\nNot at them.';
    const subtitle = searchParams.get('subtitle') || 'Live chat for small teams who care.';
    const category = searchParams.get('category') || 'LIVE CHAT';
    
    const [fraunces600, dmSans400, dmSans500, dmSans600] = await Promise.all([
      fraunces600P, dmSans400P, dmSans500P, dmSans600P
    ]);

    // Logo SVG snippet
    const LogoSVG = ({ white = true }: { white?: boolean }) => (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="48" height="48">
          <path d="M20 4C11.163 4 4 11.163 4 20C4 28.837 11.163 36 20 36C21.85 36 23.619 35.6845 25.253 35.107L32.414 37.495C33.195 37.755 33.955 36.995 33.695 36.214L31.307 29.053C34.258 26.541 36 23.428 36 20C36 11.163 28.837 4 20 4Z" fill={white ? 'white' : '#0F172A'}/>
          <circle cx="14" cy="20" r="2.5" fill={white ? '#1D4ED8' : '#FFF7ED'}/>
          <circle cx="20" cy="20" r="2.5" fill={white ? '#1D4ED8' : '#FFF7ED'}/>
          <circle cx="26" cy="20" r="2.5" fill={white ? '#1D4ED8' : '#FFF7ED'}/>
      </svg>
    );

    let content;

    // --- TEMPLATE A ---
    if (template === 'a') {
      content = (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%',
          background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)', padding: '48px', position: 'relative' }}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', width: '1000px', height: '500px' }}>
            <h1 style={{ fontSize: '72px', fontFamily: '"Fraunces"', fontWeight: 600, color: 'white', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '24px', maxWidth: '900px', whiteSpace: 'pre-wrap' }}>
              {title}
            </h1>
            <p style={{ fontSize: '32px', fontFamily: '"DM Sans"', fontWeight: 500, color: 'rgba(255, 255, 255, 0.8)', whiteSpace: 'pre-wrap' }}>
              {subtitle}
            </p>
            <div style={{ position: 'absolute', bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', width: '48px', height: '48px' }}>
                  <LogoSVG white={true} />
                </div>
                <span style={{ fontSize: '42px', fontFamily: '"Fraunces"', fontWeight: 600, color: 'white', letterSpacing: '-0.02em' }}>Chatting</span>
              </div>
            </div>
          </div>
        </div>
      );
    } 
    // --- TEMPLATE B ---
    else if (template === 'b') {
      content = (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%',
          background: 'linear-gradient(180deg, #FFFBF5 0%, #FFF7ED 100%)', padding: '48px', position: 'relative' }}>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '1000px', height: '500px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', width: '550px' }}>
              <div style={{ display: 'flex', background: '#EFF6FF', color: '#2563EB', fontFamily: '"DM Sans"', fontWeight: 600, fontSize: '14px', padding: '6px 12px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '24px' }}>
                {category}
              </div>
              <h1 style={{ fontSize: '60px', fontFamily: '"Fraunces"', fontWeight: 600, color: '#0F172A', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: '16px', maxWidth: '500px', whiteSpace: 'pre-wrap' }}>
                {title}
              </h1>
              <p style={{ fontSize: '28px', fontFamily: '"DM Sans"', fontWeight: 400, color: '#475569', maxWidth: '450px', whiteSpace: 'pre-wrap' }}>
                {subtitle}
              </p>
              <div style={{ position: 'absolute', bottom: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', width: '36px', height: '36px' }}>
                  <LogoSVG white={false} />
                </div>
                <span style={{ fontSize: '36px', fontFamily: '"Fraunces"', fontWeight: 600, color: '#0F172A', letterSpacing: '-0.02em' }}>Chatting</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', position: 'absolute', right: '0px', width: '350px', height: '350px', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ display: 'flex', position: 'absolute', top: '40px', right: '0px', width: '240px', height: '90px', background: '#2563EB', borderRadius: '16px', borderBottomRightRadius: '0', flexDirection: 'column', justifyContent: 'center', padding: '0 24px', gap: '12px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.3)', borderRadius: '999px' }} />
                <div style={{ width: '60%', height: '12px', background: 'rgba(255,255,255,0.3)', borderRadius: '999px' }} />
              </div>
              <div style={{ display: 'flex', position: 'absolute', bottom: '64px', right: '60px', width: '200px', height: '72px', background: '#10B981', borderRadius: '16px', borderBottomLeftRadius: '0', alignItems: 'center', padding: '0 24px', gap: '12px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                <div style={{ width: '12px', height: '12px', background: 'white', borderRadius: '999px' }} />
                <div style={{ width: '12px', height: '12px', background: 'white', borderRadius: '999px' }} />
                <div style={{ width: '12px', height: '12px', background: 'white', borderRadius: '999px' }} />
              </div>
              <div style={{ display: 'flex', position: 'absolute', top: '160px', left: '40px', width: '48px', height: '48px', border: '5px solid #F59E0B', borderRadius: '999px' }} />
            </div>
          </div>
        </div>
      );
    }
    // --- TEMPLATE C ---
    else if (template === 'c') {
      const competitor = searchParams.get('competitor') || 'INTERCOM';
      content = (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%',
          background: 'linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)', padding: '48px', position: 'relative' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '1000px', height: '500px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '900px', height: '260px', position: 'relative', marginBottom: '48px' }}>
              <div style={{ display: 'flex', flex: 1, backgroundColor: 'white', border: '2px solid rgba(37, 99, 235, 0.1)', borderRadius: '16px', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', marginRight: '30px', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ display: 'flex', width: '52px', height: '52px' }}>
                    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="52" height="52">
                        <path d="M20 4C11.163 4 4 11.163 4 20C4 28.837 11.163 36 20 36C21.85 36 23.619 35.6845 25.253 35.107L32.414 37.495C33.195 37.755 33.955 36.995 33.695 36.214L31.307 29.053C34.258 26.541 36 23.428 36 20C36 11.163 28.837 4 20 4Z" fill="#2563EB"/>
                        <circle cx="14" cy="20" r="2.5" fill="white"/>
                        <circle cx="20" cy="20" r="2.5" fill="white"/>
                        <circle cx="26" cy="20" r="2.5" fill="white"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: '46px', fontFamily: '"Fraunces"', fontWeight: 600, color: '#0F172A', letterSpacing: '-0.02em' }}>Chatting</span>
                </div>
              </div>

              <div style={{ display: 'flex', position: 'absolute', width: '80px', height: '80px', borderRadius: '999px', background: '#0F172A', border: '6px solid #F1F5F9', left: '410px', top: '90px', justifyContent: 'center', alignItems: 'center', fontFamily: '"Fraunces"', fontWeight: 600, color: 'white', fontSize: '32px', letterSpacing: '0.05em', zIndex: 10 }}>
                VS
              </div>

              <div style={{ display: 'flex', flex: 1, backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '16px', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', marginLeft: '30px', boxShadow: '0 8px 30px rgba(0,0,0,0.03)' }}>
                <span style={{ fontSize: '48px', fontFamily: '"DM Sans"', fontWeight: 600, color: '#1E293B', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{competitor}</span>
              </div>
            </div>

            <p style={{ fontSize: '32px', fontFamily: '"DM Sans"', fontWeight: 400, color: '#475569', textAlign: 'center', marginBottom: '16px' }}>
              {subtitle}
            </p>
            <h1 style={{ fontSize: '56px', fontFamily: '"Fraunces"', fontWeight: 600, color: '#0F172A', lineHeight: 1.2, letterSpacing: '-0.02em', textAlign: 'center' }}>
              {title}
            </h1>
          </div>
        </div>
      );
    }
    // --- TEMPLATE D ---
    else if (template === 'd') {
      content = (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%',
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', padding: '48px', position: 'relative' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', width: '1000px', height: '500px' }}>
            <h1 style={{ fontSize: '50px', fontFamily: '"Fraunces"', fontWeight: 600, color: 'white', lineHeight: 1.3, letterSpacing: '-0.02em', maxWidth: '900px', whiteSpace: 'pre-wrap' }}>
              {title}
            </h1>
            <div style={{ display: 'flex', width: '80px', height: '4px', background: '#2563EB', borderRadius: '999px', marginTop: '48px', marginBottom: '48px' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', width: '32px', height: '32px' }}>
                 <LogoSVG white={true} />
              </div>
              <p style={{ fontSize: '28px', fontFamily: '"DM Sans"', fontWeight: 400, color: 'rgba(255, 255, 255, 0.8)' }}>
                usechatting.com
              </p>
            </div>
          </div>
        </div>
      );
    }
    // --- DEFAULT FALLBACK ---
    else {
      content = (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%',
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', padding: '48px', position: 'relative' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', width: '1000px', height: '500px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', width: '80px', height: '80px' }}>
                 <LogoSVG white={true} />
              </div>
              <span style={{ fontSize: '120px', fontFamily: '"Fraunces"', fontWeight: 600, color: 'white', letterSpacing: '-0.02em' }}>
                Chatting
              </span>
            </div>
            <p style={{ fontSize: '36px', fontFamily: '"DM Sans"', fontWeight: 500, color: 'rgba(255, 255, 255, 0.9)' }}>
              Live chat for teams who care.
            </p>
          </div>
        </div>
      );
    }

    return new ImageResponse(
      content,
      {
        width: 1200,
        height: 630,
        fonts: [
          { name: 'Fraunces', data: fraunces600, weight: 600, style: 'normal' },
          { name: 'DM Sans', data: dmSans400, weight: 400, style: 'normal' },
          { name: 'DM Sans', data: dmSans500, weight: 500, style: 'normal' },
          { name: 'DM Sans', data: dmSans600, weight: 600, style: 'normal' },
        ],
      }
    );
  } catch (error: any) {
    console.error('Failed to generate OG image', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}

export const GET = withRouteErrorAlerting(handleGET, "app/api/og/route.tsx:GET");
