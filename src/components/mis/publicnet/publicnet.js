import React, { Component } from 'react';
import { Toast, Button, Icon } from 'antd-mobile';
import Title from '../../common/title/title'
import Card from '../../common/Card/card'
import Item from '../../common/Item/item'
import Loading from '../../common/Loading/loading'
import md5 from 'md5'
import '../domain.less';
import {backApp} from "../../../utils/utilFunc";

const base = {
  'LAST_NAME': '员工姓名',
  'EMPLOYEE_NUMBER': '员工编号',
}

const detail = {
  'BU_NAME': '所属BU',
  'OPEN_PORTS': '开放的端口',
  'URL': '互联网域名/URL',
  'APP_EMPLOYEE_NAME': '应用系统负责人',
  'SEC_EMPLOYEE_NAME': '应用系统安全管理员',
  'SYS_EMPLOYEE_NAME': '应用系统管理员',
  'APP_TYPE': '应用类型',
  'HOST_LOCATION': '服务器位置/托管商名称',
  'NET_FLAG': '内/外网归属标识',
  'BUSINESS_DESC': '业务描述、使用人员',
}

export default class Publicnet extends Component{
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      loading: false
    }
  }

  componentDidMount() {
    const { match, user, getMisInfo } = this.props
    console.log(user.personId, match.params.data)
    const key = 'xxe7b*jw'
    const md = md5(`${user.personId}_${key}_${match.params.data}_${key}`)
    const param = `method=GetOpenNetworkApplicationDetail&personId=${user.personId}&ApplicationID=${match.params.data}&encryptedstr=${md}`
    this.setState({ loading: true })
    getMisInfo(param).then(res => {
      this.setState({ loading: false })
      if (!res || !res.response) {
        Toast.fail('网络错误')
        return false
      } else if (res && res.response && res.response.resultCode !== '000000') {
        Toast.fail(res.response.resultMessage)
        return false
      } else if (res && res.response && res.response.resultCode === '000000') {
        this.setState({ data: res.response.result })
      }
    })
  }

  itemDomFunc = (type) => {
    const {data} = this.state
    const exteranalData = data['EXTERNAL_DATA']
    if (Object.keys(data).length === 0) {
      return false
    }
    if (type === 'base') {
      return Object.keys(base).map((i, idx) => {
        return <Item
          key={idx}
          lt={base[i]}
          rt={data[i]}
        />
      })
    } else if (type === 'detail') {
      return Object.keys(detail).map((i, idx) => {
        return <Item
          key={idx}
          lt={detail[i]}
          rt={i !== 'REMARKS' ? exteranalData[i] : data[i]}
        />
      })
    } else if (type === 'remark') {
      return <Item lt='备注' rt={data.REMARKS}/>
    }

  }

  approveFunc = (status) => {
    const {misApprove, match, user} = this.props
    const {data, iptValue} = this.state
    const param = `SystemID=515&ApplicationID=${match.params.data}&ApplicationProcessID=${data.APPLICATION_PROCESS_ID}&ApproverID=${user.personId}&ApproveResult=${status}&RejectReason=${this.state.iptValue}&IsAgentApprove=${data.IS_AGENT_APPROVER}`
    if (status === 0 && iptValue === '') {
      Toast.fail('审批拒绝请输入原因')
      return false
    }
    this.setState({loading: true})
    misApprove(param).then(res => {
      this.setState({loading: false})
      if (res && res.response && res.response.statusCode === 'SUCCESS') {
        Toast.success('审批成功')
        backApp();
      } else if (res && res.response && res.response.statusCode !== 'SUCCESS') {
        Toast.fail(res.response.msgDesc)
        return false
      }
    })
  }

  render() {
    return <div className='domainBody'>
      <Title
        titleText='开通公网'
        isHome={true}
      />
      <div className='scrollBody'>
         {/*内容*/}
        <Card
          title='申请人信息'
          children={this.itemDomFunc('base')}
        />
        <Card
          title='开通公网申请'
          children={this.itemDomFunc('detail')}
        />
        {
          this.state.data.REMARKS !== '' ?
            <Card
              title='备注'
              children={this.itemDomFunc('remark')}
            /> : null
        }
        {this.state.data.IS_APPROVER_PERSON === 1 ? <div style={{height: '142px'}}/> : <div style={{height: '10px'}}/>}
        {this.state.data.IS_APPROVER_PERSON === 1 ?
          <div className='approve'>
            <textarea placeholder='审批意见...' onChange={e => {
              this.setState({iptValue: e.target.value})
            }}></textarea>
            <div className='approveBtn'>
              <Button
                type='ghost'
                className='ghost two-btn'
                onClick={() => {
                  this.approveFunc(0)
                }}
              >
                拒绝
              </Button>
              <Button
                type='primary'
                className='primate two-btn'
                onClick={() => {
                  this.approveFunc(1)
                }}
              >
                通过
              </Button>
            </div>
          </div> : null
        }
      </div>
      {
        this.state.loading ?
          <Loading/> : null
      }
    </div>
  }
}
