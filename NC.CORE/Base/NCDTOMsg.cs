using System;
using System.Collections.Generic;
using System.Text;

namespace NC.CORE.Base
{
    public class NCDTOMsg
    {
        private byte _type;
        private string _msg;
        private byte _level;
        
        public void setMsg(string msg)
        {
            this._msg = msg;
        }
        public void setType(byte type)
        {
            this._type = type;

        }
        public void setLevel(byte type)
        {
            this._level = type;
        }
        public string getMsg()
        {
            return this._msg;
        }
        public byte getType()
        {
            return this._type;
        }
        public byte getLevel()
        {
            return this._level;
        }
    }
}
