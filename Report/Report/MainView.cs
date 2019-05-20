using DevExpress.Spreadsheet;
using DevExpress.Utils.MVVM;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Windows.Forms;

namespace Report
{
    public partial class MainView : DevExpress.XtraEditors.XtraForm
    {
        DataSet dataSet;
        IWorkbook template;
        public MainView()
        {
            InitializeComponent();
            
        }

        private void barButtonItem1_ItemClick(object sender, DevExpress.XtraBars.ItemClickEventArgs e)
        {
            DialogResult fo = openFileDialog1.ShowDialog();
            if (fo == DialogResult.OK)
            {
                dataSet = new DataSet();
                dataSet.ReadXml(openFileDialog1.FileName, XmlReadMode.ReadSchema);

                template = spreadsheetControl1.Document;
                template.MailMergeDataSource = dataSet;
            }
        }

        private void spreadsheetControl1_DocumentLoaded(object sender, EventArgs e)
        {
            try
            {
                var a = spreadsheetControl1.Document.Path + ".xml";
                dataSet = new DataSet();
                dataSet.ReadXml(a, XmlReadMode.ReadSchema);

                template = spreadsheetControl1.Document;
                template.MailMergeDataSource = dataSet;
            }
            catch { }
            
        }
    }
}
