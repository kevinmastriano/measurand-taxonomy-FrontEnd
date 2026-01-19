import fs from 'fs';
import path from 'path';

async function getLicenseContent() {
  try {
    const licensePath = path.join(process.cwd(), '..', 'LICENSE');
    const copyrightPath = path.join(process.cwd(), '..', 'COPYRIGHT');
    
    const license = fs.readFileSync(licensePath, 'utf-8');
    const copyright = fs.readFileSync(copyrightPath, 'utf-8');
    
    return { license, copyright };
  } catch (error) {
    console.error('Error loading license:', error);
    return { license: '', copyright: '' };
  }
}

export default async function LicensePage() {
  const { license, copyright } = await getLicenseContent();

  return (
    <div>
      <div className="mb-8 pb-8 border-b border-[#d0d7de] dark:border-[#30363d]">
        <h1 className="text-3xl font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2">
          License & Copyright
        </h1>
        <p className="text-[#656d76] dark:text-[#8b949e] text-base">
          Information about the licensing and copyright of the Measurand Taxonomy Catalog.
        </p>
      </div>

      <div className="space-y-6">
        <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md overflow-hidden bg-[#ffffff] dark:bg-[#0d1117]">
          <div className="px-6 py-4 border-b border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#161b22]">
            <h2 className="text-xl font-semibold text-[#24292f] dark:text-[#e6edf3]">
              Copyright
            </h2>
          </div>
          <div className="p-6 bg-[#ffffff] dark:bg-[#0d1117]">
            <pre className="whitespace-pre-wrap text-sm text-[#24292f] dark:text-[#e6edf3] font-sans leading-relaxed bg-[#f6f8fa] dark:bg-[#161b22] p-4 rounded-md border border-[#d0d7de] dark:border-[#30363d] overflow-x-auto">
              {copyright}
            </pre>
          </div>
        </div>

        <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md overflow-hidden bg-[#ffffff] dark:bg-[#0d1117]">
          <div className="px-6 py-4 border-b border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#161b22]">
            <h2 className="text-xl font-semibold text-[#24292f] dark:text-[#e6edf3]">
              License
            </h2>
          </div>
          <div className="p-6">
            <div className="mb-6">
              <p className="text-[#24292f] dark:text-[#e6edf3] mb-4">
                This work is licensed under a{' '}
                <a
                  href="https://creativecommons.org/licenses/by-sa/4.0/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0969da] dark:text-[#58a6ff] hover:underline focus:outline-none focus:ring-2 focus:ring-[#0969da] dark:focus:ring-[#58a6ff] rounded"
                >
                  Creative Commons Attribution-ShareAlike 4.0 International License
                </a>
                .
              </p>
              <div className="flex items-center gap-4 mb-4">
                <a
                  href="https://creativecommons.org/licenses/by-sa/4.0/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src="https://licensebuttons.net/l/by-sa/4.0/88x31.png"
                    alt="CC BY-SA 4.0"
                    className="border border-[#d0d7de] dark:border-[#30363d] rounded bg-[#ffffff] dark:bg-[#0d1117] p-1"
                  />
                </a>
              </div>
            </div>
            <div className="border-t border-[#d0d7de] dark:border-[#30363d] pt-6">
              <pre className="whitespace-pre-wrap text-sm text-[#24292f] dark:text-[#e6edf3] font-sans leading-relaxed max-h-[600px] overflow-y-auto bg-[#f6f8fa] dark:bg-[#161b22] p-4 rounded-md border border-[#d0d7de] dark:border-[#30363d]">
                {license}
              </pre>
            </div>
          </div>
        </div>

        <div className="border border-[#54aeff] dark:border-[#1f6feb] rounded-md overflow-hidden bg-[#ddf4ff] dark:bg-[#0c2d41]">
          <div className="px-6 py-4">
            <h3 className="text-lg font-semibold text-[#0969da] dark:text-[#58a6ff] mb-3">
              Quick Summary
            </h3>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li className="text-[#0969da] dark:text-[#58a6ff]">
                <strong className="text-[#24292f] dark:text-[#e6edf3]">You are free to:</strong> Share and adapt the material for any purpose, even commercially.
              </li>
              <li className="text-[#0969da] dark:text-[#58a6ff]">
                <strong className="text-[#24292f] dark:text-[#e6edf3]">Under the following terms:</strong>
                <ul className="list-disc list-inside ml-6 mt-1 space-y-1 text-[#656d76] dark:text-[#8b949e]">
                  <li>Attribution — You must give appropriate credit</li>
                  <li>ShareAlike — If you remix, transform, or build upon the material, you must distribute your contributions under the same license</li>
                </ul>
              </li>
              <li className="text-[#0969da] dark:text-[#58a6ff]">
                <strong className="text-[#24292f] dark:text-[#e6edf3]">No additional restrictions:</strong> You may not apply legal terms or technological measures that legally restrict others from doing anything the license permits.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

