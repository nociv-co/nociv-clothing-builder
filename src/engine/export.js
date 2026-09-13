/**
 * Dynamic Multi-Page Tiling & Vector Export Engine
 */

// DPI ratio for web SVG rendering (96 pixels per inch)
const DPI = 96;

/**
 * Calculates page tiling grid dimensions for a given master SVG element
 */
export function calculateTileLayout(svgElement, paperWidthInches = 8.5, paperHeightInches = 11.0, marginInches = 0.5) {
  if (!svgElement) return { cols: 1, rows: 1, totalPages: 1, printableWidth: 7.5, printableHeight: 10 };

  const bbox = svgElement.getBBox ? svgElement.getBBox() : { width: 800, height: 600 };
  const patternWidthInches = (bbox.width || 800) / DPI;
  const patternHeightInches = (bbox.height || 600) / DPI;

  const printableWidth = paperWidthInches - (marginInches * 2);
  const printableHeight = paperHeightInches - (marginInches * 2);

  const cols = Math.max(1, Math.ceil(patternWidthInches / printableWidth));
  const rows = Math.max(1, Math.ceil(patternHeightInches / printableHeight));

  return {
    cols,
    rows,
    totalPages: cols * rows,
    patternWidthInches,
    patternHeightInches,
    printableWidth,
    printableHeight,
    paperWidthInches,
    paperHeightInches,
    marginInches
  };
}

/**
 * Triggers a 1:1 multi-page print stylesheet document that segments 
 * full-scale master patterns across standard printable sheets with 
 * grid registration crosshairs, page indexes, and a calibration test square.
 */
export function generateTiledPDFPrint(svgElement, state) {
  if (!svgElement) return;

  const layout = calculateTileLayout(svgElement);
  const svgString = new XMLSerializer().serializeToString(svgElement);

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to generate multi-page PDF tiling.');
    return;
  }

  let pagesHTML = '';

  for (let r = 0; r < layout.rows; r++) {
    for (let c = 0; c < layout.cols; c++) {
      const tileId = `${String.fromCharCode(65 + r)}${c + 1}`;
      const shiftX = -(c * layout.printableWidth * DPI);
      const shiftY = -(r * layout.printableHeight * DPI);

      // Page 1 receives the 1.0" calibration verification box
      const isPageOne = (r === 0 && c === 0);
      const testSquareHTML = isPageOne ? `
        <div class="test-square-box">
          <div class="test-square"></div>
          <div class="test-square-label">1.0" x 1.0"<br>TEST SQUARE</div>
        </div>
      ` : '';

      pagesHTML += `
        <div class="print-page">
          <div class="margin-boundary">
            <!-- Header Metadata -->
            <div class="page-header">
              <span>NOCIV PATTERN ENGINE // ${state.archetype.toUpperCase()} - ${state.selectedCut.toUpperCase()}</span>
              <span>TILE <strong>${tileId}</strong> (ROW ${r + 1}/${layout.rows}, COL ${c + 1}/${layout.cols})</span>
            </div>

            <!-- SVG Tile Viewport Clipping -->
            <div class="tile-viewport">
              <div class="tile-content" style="transform: translate(${shiftX}px, ${shiftY}px);">
                ${svgString}
              </div>
            </div>

            <!-- Alignment Crosshairs -->
            <div class="crosshair top-left">+</div>
            <div class="crosshair top-right">+</div>
            <div class="crosshair bottom-left">+</div>
            <div class="crosshair bottom-right">+</div>

            ${testSquareHTML}

            <!-- Footer Margin Alignment Line -->
            <div class="page-footer">
              <span>ALIGNMENT: MATCH CROSSHAIRS & TRIM ALONG BORDER</span>
              <span>SCALE: 100% / ACTUAL SIZE</span>
            </div>
          </div>
        </div>
      `;
    }
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>NOCIV_TILED_PATTERN_${state.archetype.toUpperCase()}</title>
        <style>
          @page {
            size: 8.5in 11in;
            margin: 0;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact;
          }
          body {
            margin: 0;
            padding: 0;
            font-family: monospace;
            background: #fff;
          }
          .print-page {
            width: 8.5in;
            height: 11in;
            page-break-after: always;
            position: relative;
            padding: 0.5in;
            overflow: hidden;
          }
          .margin-boundary {
            width: 7.5in;
            height: 10in;
            border: 1px dashed #999;
            position: relative;
            overflow: hidden;
          }
          .page-header {
            position: absolute;
            top: 4px;
            left: 6px;
            right: 6px;
            display: flex;
            justify-content: space-between;
            font-size: 8px;
            font-weight: bold;
            z-index: 100;
            background: rgba(255, 255, 255, 0.85);
            padding: 2px 4px;
          }
          .page-footer {
            position: absolute;
            bottom: 4px;
            left: 6px;
            right: 6px;
            display: flex;
            justify-content: space-between;
            font-size: 8px;
            z-index: 100;
            background: rgba(255, 255, 255, 0.85);
            padding: 2px 4px;
          }
          .tile-viewport {
            width: 7.5in;
            height: 10in;
            position: absolute;
            top: 0;
            left: 0;
            overflow: hidden;
          }
          .tile-content {
            position: absolute;
            top: 0;
            left: 0;
            transform-origin: top left;
          }
          .crosshair {
            position: absolute;
            font-size: 14px;
            font-weight: bold;
            line-height: 1;
            color: #000;
            z-index: 101;
          }
          .top-left { top: 2px; left: 4px; }
          .top-right { top: 2px; right: 4px; }
          .bottom-left { bottom: 2px; left: 4px; }
          .bottom-right { bottom: 2px; right: 4px; }

          .test-square-box {
            position: absolute;
            bottom: 25px;
            left: 15px;
            border: 1px solid #000;
            background: #fff;
            padding: 4px;
            display: flex;
            align-items: center;
            gap: 6px;
            z-index: 102;
          }
          .test-square {
            width: 1.0in;
            height: 1.0in;
            border: 2px solid #000;
            background: #f0f0f0;
          }
          .test-square-label {
            font-size: 8px;
            font-weight: bold;
            line-height: 1.2;
          }
        </style>
      </head>
      <body>
        ${pagesHTML}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
}

export function exportScaledSVG(svgElement) {
  if (!svgElement) return;
  const clone = svgElement.cloneNode(true);
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  const svgData = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `NOCIV_PATTERN_${Date.now()}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportTechPackJSON(state) {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
  const link = document.createElement('a');
  link.setAttribute('href', dataStr);
  link.setAttribute('download', `NOCIV_TECH_PACK_${state.archetype}_${Date.now()}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
