

class GlobalHelper{
    formatMoney(x, fractional=false) {
        var money =  x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        if(fractional){
            money = money + '.00';
        }

        return money;
    }

    MessageLibrary(lang,code)
	{
		var eng = '';
		var ind = '';
		switch(code)
		{
			case 'POST_1':
					eng = 'please fill the post correctly\n';
					ind = 'Mohon mengisi post dengan benar\n';
				break;
			case 'POST_2':
					eng = 'you must specify at least 1 person to be recognized\n';
					ind = 'Anda harus memilih minimal 1 orang\n';
				break;
			case 'POST_3':
					eng = 'you must select at least 1 signature & behavior\n';
					ind = 'Anda harus memilih minimal 1 signature & behavior\n';
				break;
			case 'POST_4':
					eng = 'post comment must have at least 10 characters\n';
					ind = 'Komentar setidaknya berisikan 10 karakter\n';
				break;
			case 'POST_5':
					eng = 'invalid input data for';
					ind = 'isian tidak sesuai untuk';
				break;
			case 'POST_6':
					eng = 'incomplete input data for';
					ind = 'isian tidak lengkap untuk';
				break;
			case 'POST_7':
					eng = 'Your profile picture has been updated';
					ind = 'foto profile anda berhasil diubah';
				break;
			case 'POST_8':
					eng = 'Thanks for your posting';
					ind = 'Terima kasih untuk posting anda';
				break;
			case 'POST_9':
					eng = 'You have selected an image from the e-card, the image you have selected here will not be uploaded';
					ind = 'Anda sudah memilih gambar dari e-card, gambar yang sudah anda pilih disini tidak akan di unggah';
				break;
			case 'POST_10':
					eng = 'The images that you have uploaded will be replaced with images from this card';
					ind = 'Gambar yang sudah anda unggah akan diganti dengan gambar dari kartu ini';
				break;


			
			
		}
		return (lang == 1 ? eng : eng);
	}
    GetParameterQueryStringByName(name, url){
        var qIndex = url.indexOf('?');
        var url_components = qIndex === -1 ? '' : url.slice(qIndex + 1);
        if(url_components===null || url_components===''){
            return ''
        }else{
			var url_components = url_components.split("=");
			return url_components
            // return (url_components[1]==null?'':url_components[1])
        } 
    }

    RelativeTime(timeStamp,lang_period=null){
        //ga kepake helper ini diganti pake moment js
	}
	
}

export default new GlobalHelper();