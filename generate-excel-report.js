const fs = require('fs');
const xml2js = require('xml2js');
const ExcelJS = require('exceljs');

const xmlFile = 'reports/newman-results.xml';
const excelFile = 'reports/ERPNext-API-Test-Results.xlsx';

async function generateReport() {
    const xml = fs.readFileSync(xmlFile, 'utf8');

    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(xml);

    const workbook = new ExcelJS.Workbook();

    // =========================
    // Sheet 1: Summary
    // =========================
    const summary = workbook.addWorksheet('Summary');

    summary.columns = [
        { header: 'Request #', key: 'requestNumber', width: 12 },
        { header: 'API Request', key: 'requestName', width: 40 },
        { header: 'Assertions', key: 'assertions', width: 12 },
        { header: 'Passed', key: 'passed', width: 12 },
        { header: 'Failed', key: 'failed', width: 12 },
        { header: 'Response Time (ms)', key: 'responseTime', width: 20 },
        { header: 'Result', key: 'status', width: 12 }
    ];

    // =========================
    // Sheet 2: Assertion Details
    // =========================
    const details = workbook.addWorksheet('Assertion Details');

    details.columns = [
        { header: 'Request #', key: 'requestNumber', width: 12 },
        { header: 'API Request', key: 'requestName', width: 40 },
        { header: 'Assertion', key: 'assertion', width: 55 },
        { header: 'Result', key: 'status', width: 12 },
        { header: 'Time (ms)', key: 'time', width: 15 }
    ];

    const suites = result.testsuites.testsuite || [];

    suites.forEach(suite => {
        const suiteInfo = suite.$;

        const requestName = suiteInfo.name;
        const requestNumber = requestName.split(' - ')[0];

        const assertions = parseInt(suiteInfo.tests || '0');
        const failures = parseInt(suiteInfo.failures || '0');
        const passed = assertions - failures;
        const responseTime = Math.round(
            parseFloat(suiteInfo.time || '0') * 1000
        );

        summary.addRow({
            requestNumber: requestNumber,
            requestName: requestName,
            assertions: assertions,
            passed: passed,
            failed: failures,
            responseTime: responseTime,
            status: failures === 0 ? 'PASS' : 'FAIL'
        });

        const testCases = suite.testcase || [];

        testCases.forEach(testCase => {
            const failed =
                testCase.failure &&
                testCase.failure.length > 0;

            details.addRow({
                requestNumber: requestNumber,
                requestName: requestName,
                assertion: testCase.$.name,
                status: failed ? 'FAIL' : 'PASS',
                time: Math.round(
                    parseFloat(testCase.$.time || '0') * 1000
                )
            });
        });
    });

    // Freeze headers
    summary.views = [{ state: 'frozen', ySplit: 1 }];
    details.views = [{ state: 'frozen', ySplit: 1 }];

    // Enable filters
    summary.autoFilter = {
        from: 'A1',
        to: 'G1'
    };

    details.autoFilter = {
        from: 'A1',
        to: 'E1'
    };

    // Bold headers
    summary.getRow(1).font = { bold: true };
    details.getRow(1).font = { bold: true };

    await workbook.xlsx.writeFile(excelFile);

    console.log(`Excel report generated: ${excelFile}`);
}

generateReport().catch(error => {
    console.error('Failed to generate Excel report:');
    console.error(error);
    process.exit(1);
});